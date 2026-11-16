package cache

import (
	"container/list"
	"strings"
	"sync"
)

// BlobEntry is a cached binary object (e.g. a preview PNG) plus its ETag.
type BlobEntry struct {
	Data        []byte
	ContentType string
	ETag        string
}

type lruItem struct {
	key   string
	value BlobEntry
}

// BytesLRU is a size-bounded LRU cache for binary blobs.
type BytesLRU struct {
	mu       sync.Mutex
	ll       *list.List
	items    map[string]*list.Element
	size     int64
	maxBytes int64
	maxItem  int64
}

// NewBytesLRU creates a cache holding at most maxBytes in total; single
// objects larger than maxItemBytes are never cached.
func NewBytesLRU(maxBytes, maxItemBytes int64) *BytesLRU {
	return &BytesLRU{
		ll:       list.New(),
		items:    make(map[string]*list.Element),
		maxBytes: maxBytes,
		maxItem:  maxItemBytes,
	}
}

func (c *BytesLRU) Get(key string) (BlobEntry, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()

	el, ok := c.items[key]
	if !ok {
		return BlobEntry{}, false
	}

	c.ll.MoveToFront(el)

	return el.Value.(*lruItem).value, true
}

func (c *BytesLRU) Set(key string, value BlobEntry) {
	n := int64(len(value.Data))
	if n == 0 || n > c.maxItem || n > c.maxBytes {
		return
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	if el, ok := c.items[key]; ok {
		c.size -= int64(len(el.Value.(*lruItem).value.Data))
		el.Value.(*lruItem).value = value
		c.ll.MoveToFront(el)
	} else {
		c.items[key] = c.ll.PushFront(&lruItem{key: key, value: value})
	}

	c.size += n

	for c.size > c.maxBytes {
		c.removeElement(c.ll.Back())
	}
}

// DeletePrefix removes every key starting with prefix.
func (c *BytesLRU) DeletePrefix(prefix string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	for k, el := range c.items {
		if strings.HasPrefix(k, prefix) {
			c.removeElement(el)
		}
	}
}

func (c *BytesLRU) removeElement(el *list.Element) {
	if el == nil {
		return
	}

	item := el.Value.(*lruItem)
	c.ll.Remove(el)
	delete(c.items, item.key)
	c.size -= int64(len(item.value.Data))
}
