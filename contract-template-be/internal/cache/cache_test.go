package cache

import (
	"errors"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func TestSWRServesFreshValueWithoutReloading(t *testing.T) {
	c := NewSWR[int](time.Minute, time.Hour, 10)

	var calls atomic.Int32
	load := func() (int, error) { return int(calls.Add(1)), nil }

	for i := 0; i < 5; i++ {
		v, err := c.GetOrLoad("k", load)
		if err != nil || v != 1 {
			t.Fatalf("got (%d, %v), want (1, nil)", v, err)
		}
	}

	if calls.Load() != 1 {
		t.Fatalf("loader called %d times, want 1", calls.Load())
	}
}

func TestSWRServesStaleAndRefreshesInBackground(t *testing.T) {
	c := NewSWR[int](10*time.Millisecond, time.Hour, 10)

	var calls atomic.Int32
	load := func() (int, error) { return int(calls.Add(1)), nil }

	if v, _ := c.GetOrLoad("k", load); v != 1 {
		t.Fatalf("first load = %d, want 1", v)
	}

	time.Sleep(20 * time.Millisecond)

	// Stale: the old value is returned immediately…
	if v, _ := c.GetOrLoad("k", load); v != 1 {
		t.Fatalf("stale read = %d, want 1", v)
	}

	// …and a background refresh replaces it shortly after. (With coarse OS
	// timers further refreshes may already have happened, hence >= 2.)
	deadline := time.Now().Add(time.Second)
	for time.Now().Before(deadline) {
		if v, _ := c.GetOrLoad("k", load); v >= 2 {
			return
		}
		time.Sleep(5 * time.Millisecond)
	}

	t.Fatal("background refresh never stored the new value")
}

func TestSWRReloadsSynchronouslyAfterMaxStale(t *testing.T) {
	c := NewSWR[int](5*time.Millisecond, 10*time.Millisecond, 10)

	var calls atomic.Int32
	load := func() (int, error) { return int(calls.Add(1)), nil }

	c.GetOrLoad("k", load)
	time.Sleep(20 * time.Millisecond)

	if v, _ := c.GetOrLoad("k", load); v != 2 {
		t.Fatalf("expired read = %d, want fresh value 2", v)
	}
}

func TestSWRDoesNotCacheErrors(t *testing.T) {
	c := NewSWR[int](time.Minute, time.Hour, 10)
	boom := errors.New("boom")

	if _, err := c.GetOrLoad("k", func() (int, error) { return 0, boom }); !errors.Is(err, boom) {
		t.Fatalf("err = %v, want boom", err)
	}

	v, err := c.GetOrLoad("k", func() (int, error) { return 7, nil })
	if err != nil || v != 7 {
		t.Fatalf("got (%d, %v) after error, want (7, nil)", v, err)
	}
}

func TestSWRCollapsesConcurrentLoads(t *testing.T) {
	c := NewSWR[int](time.Minute, time.Hour, 10)

	var calls atomic.Int32
	release := make(chan struct{})
	load := func() (int, error) {
		calls.Add(1)
		<-release
		return 42, nil
	}

	var wg sync.WaitGroup
	for i := 0; i < 20; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if v, _ := c.GetOrLoad("k", load); v != 42 {
				t.Errorf("v = %d, want 42", v)
			}
		}()
	}

	time.Sleep(20 * time.Millisecond)
	close(release)
	wg.Wait()

	if calls.Load() != 1 {
		t.Fatalf("loader called %d times, want 1", calls.Load())
	}
}

func TestSWRDeleteAndDeletePrefix(t *testing.T) {
	c := NewSWR[string](time.Minute, time.Hour, 10)
	load := func(v string) func() (string, error) {
		return func() (string, error) { return v, nil }
	}

	c.GetOrLoad("list:1", load("a"))
	c.GetOrLoad("list:2", load("b"))
	c.GetOrLoad("detail:1", load("c"))

	c.DeletePrefix("list:")
	c.Delete("detail:1")

	for _, k := range []string{"list:1", "list:2", "detail:1"} {
		if v, _ := c.GetOrLoad(k, load("new")); v != "new" {
			t.Fatalf("%s = %q after delete, want reload", k, v)
		}
	}
}

func TestSWREvictsWhenFull(t *testing.T) {
	c := NewSWR[int](time.Minute, time.Hour, 2)
	one := func() (int, error) { return 1, nil }

	c.GetOrLoad("a", one)
	time.Sleep(time.Millisecond)
	c.GetOrLoad("b", one)
	c.GetOrLoad("c", one)

	c.mu.RLock()
	n := len(c.items)
	_, hasOldest := c.items["a"]
	c.mu.RUnlock()

	if n != 2 || hasOldest {
		t.Fatalf("items = %d (has a: %v), want 2 without the oldest key", n, hasOldest)
	}
}

func TestBytesLRUEvictsLeastRecentlyUsed(t *testing.T) {
	c := NewBytesLRU(10, 10)

	c.Set("a", BlobEntry{Data: make([]byte, 4)})
	c.Set("b", BlobEntry{Data: make([]byte, 4)})
	c.Get("a") // a is now most recently used
	c.Set("c", BlobEntry{Data: make([]byte, 4)})

	if _, ok := c.Get("b"); ok {
		t.Fatal("b should have been evicted")
	}

	for _, k := range []string{"a", "c"} {
		if _, ok := c.Get(k); !ok {
			t.Fatalf("%s should still be cached", k)
		}
	}
}

func TestBytesLRURejectsOversizedItemsAndDeletesPrefix(t *testing.T) {
	c := NewBytesLRU(100, 5)

	c.Set("big", BlobEntry{Data: make([]byte, 6)})
	if _, ok := c.Get("big"); ok {
		t.Fatal("item above maxItemBytes must not be cached")
	}

	c.Set("contracts/1/a.png", BlobEntry{Data: []byte("x")})
	c.Set("contracts/2/a.png", BlobEntry{Data: []byte("y")})
	c.DeletePrefix("contracts/1/")

	if _, ok := c.Get("contracts/1/a.png"); ok {
		t.Fatal("prefix delete did not remove contracts/1")
	}
	if _, ok := c.Get("contracts/2/a.png"); !ok {
		t.Fatal("prefix delete removed an unrelated key")
	}

	// Overwriting a key must keep the size accounting correct.
	c.Set("contracts/2/a.png", BlobEntry{Data: []byte("yy")})
	if c.size != 2 {
		t.Fatalf("size = %d, want 2", c.size)
	}
}
