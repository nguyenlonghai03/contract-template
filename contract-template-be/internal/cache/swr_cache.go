// Package cache provides small in-memory caches for hot, read-only public
// endpoints. Data lives only in this process — it is a latency optimisation,
// never a source of truth.
package cache

import (
	"strings"
	"sync"
	"time"

	"golang.org/x/sync/singleflight"
)

type entry[V any] struct {
	value     V
	fetchedAt time.Time
}

// SWRCache is a stale-while-revalidate cache:
//   - age < fresh:            served from memory, no DB access.
//   - fresh <= age < maxStale: served from memory immediately, refreshed in background.
//   - age >= maxStale / miss:  loaded synchronously.
//
// Concurrent loads of the same key are collapsed (singleflight), so a burst of
// requests after expiry hits the database once. Errors are never cached.
type SWRCache[V any] struct {
	mu       sync.RWMutex
	items    map[string]*entry[V]
	fresh    time.Duration
	maxStale time.Duration
	maxItems int
	group    singleflight.Group
}

func NewSWR[V any](fresh, maxStale time.Duration, maxItems int) *SWRCache[V] {
	if maxStale < fresh {
		maxStale = fresh
	}

	return &SWRCache[V]{
		items:    make(map[string]*entry[V]),
		fresh:    fresh,
		maxStale: maxStale,
		maxItems: maxItems,
	}
}

// GetOrLoad returns the cached value for key, loading it with load when needed.
func (c *SWRCache[V]) GetOrLoad(key string, load func() (V, error)) (V, error) {
	c.mu.RLock()
	e, ok := c.items[key]
	c.mu.RUnlock()

	if ok {
		age := time.Since(e.fetchedAt)

		if age < c.fresh {
			return e.value, nil
		}

		if age < c.maxStale {
			// Serve stale now, refresh in the background (deduplicated).
			go func() {
				// A panic in a background refresh must never crash the server.
				defer func() { _ = recover() }()

				_, _, _ = c.group.Do(key, func() (any, error) {
					return c.loadAndStore(key, load)
				})
			}()

			return e.value, nil
		}
	}

	v, err, _ := c.group.Do(key, func() (any, error) {
		return c.loadAndStore(key, load)
	})

	if err != nil {
		var zero V
		return zero, err
	}

	return v.(V), nil
}

func (c *SWRCache[V]) loadAndStore(key string, load func() (V, error)) (V, error) {
	v, err := load()
	if err != nil {
		return v, err
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	if _, exists := c.items[key]; !exists && c.maxItems > 0 && len(c.items) >= c.maxItems {
		c.evictLocked()
	}

	c.items[key] = &entry[V]{value: v, fetchedAt: time.Now()}

	return v, nil
}

// evictLocked drops entries past maxStale; if none, drops the oldest entry.
func (c *SWRCache[V]) evictLocked() {
	var oldestKey string
	var oldestAt time.Time

	for k, e := range c.items {
		if time.Since(e.fetchedAt) >= c.maxStale {
			delete(c.items, k)
			continue
		}

		if oldestKey == "" || e.fetchedAt.Before(oldestAt) {
			oldestKey, oldestAt = k, e.fetchedAt
		}
	}

	if len(c.items) >= c.maxItems && oldestKey != "" {
		delete(c.items, oldestKey)
	}
}

// Delete removes a single key.
func (c *SWRCache[V]) Delete(key string) {
	c.mu.Lock()
	delete(c.items, key)
	c.mu.Unlock()
}

// DeletePrefix removes every key starting with prefix ("" clears everything).
func (c *SWRCache[V]) DeletePrefix(prefix string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	for k := range c.items {
		if strings.HasPrefix(k, prefix) {
			delete(c.items, k)
		}
	}
}
