/**
 * Concurrency Module - Shared-Memory Safe Operations
 * Implements thread-safe patterns for concurrent data access
 */

/**
 * ReadWriteLock - Allows multiple readers or single writer
 * Ensures safe concurrent access to shared resources
 */
export class ReadWriteLock {
  private readers = 0;
  private writer = false;
  private writeQueue: Array<() => void> = [];
  private readQueue: Array<() => void> = [];

  /**
   * Acquire read lock (multiple readers allowed)
   */
  async acquireRead(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.writer && this.writeQueue.length === 0) {
        this.readers++;
        resolve();
      } else {
        this.readQueue.push(() => {
          this.readers++;
          resolve();
        });
      }
    });
  }

  /**
   * Release read lock
   */
  releaseRead(): void {
    this.readers--;
    if (this.readers === 0 && this.writeQueue.length > 0) {
      this.writer = true;
      const writer = this.writeQueue.shift();
      writer?.();
    }
  }

  /**
   * Acquire write lock (exclusive access)
   */
  async acquireWrite(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.writer && this.readers === 0) {
        this.writer = true;
        resolve();
      } else {
        this.writeQueue.push(() => {
          this.writer = true;
          resolve();
        });
      }
    });
  }

  /**
   * Release write lock
   */
  releaseWrite(): void {
    this.writer = false;
    
    // Process waiting writers first (writer preference)
    if (this.writeQueue.length > 0) {
      const writer = this.writeQueue.shift();
      writer?.();
    } else {
      // Allow all waiting readers
      while (this.readQueue.length > 0) {
        const reader = this.readQueue.shift();
        reader?.();
      }
    }
  }

  /**
   * Execute function with read lock
   */
  async withReadLock<T>(fn: () => Promise<T> | T): Promise<T> {
    await this.acquireRead();
    try {
      return await fn();
    } finally {
      this.releaseRead();
    }
  }

  /**
   * Execute function with write lock
   */
  async withWriteLock<T>(fn: () => Promise<T> | T): Promise<T> {
    await this.acquireWrite();
    try {
      return await fn();
    } finally {
      this.releaseWrite();
    }
  }
}

/**
 * Mutex - Mutual exclusion lock for critical sections
 */
export class Mutex {
  private locked = false;
  private queue: Array<() => void> = [];

  /**
   * Acquire mutex lock
   */
  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.locked) {
        this.locked = true;
        resolve();
      } else {
        this.queue.push(() => {
          this.locked = true;
          resolve();
        });
      }
    });
  }

  /**
   * Release mutex lock
   */
  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next?.();
    } else {
      this.locked = false;
    }
  }

  /**
   * Execute function with mutex lock
   */
  async withLock<T>(fn: () => Promise<T> | T): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  /**
   * Check if mutex is currently locked
   */
  isLocked(): boolean {
    return this.locked;
  }
}

/**
 * Semaphore - Counting semaphore for resource pool management
 */
export class Semaphore {
  private permits: number;
  private queue: Array<() => void> = [];

  constructor(initialPermits: number) {
    this.permits = initialPermits;
  }

  /**
   * Acquire a permit
   */
  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      if (this.permits > 0) {
        this.permits--;
        resolve();
      } else {
        this.queue.push(() => {
          this.permits--;
          resolve();
        });
      }
    });
  }

  /**
   * Release a permit
   */
  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next?.();
    } else {
      this.permits++;
    }
  }

  /**
   * Execute function with semaphore
   */
  async withPermit<T>(fn: () => Promise<T> | T): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  /**
   * Get available permits
   */
  availablePermits(): number {
    return this.permits;
  }
}

/**
 * AtomicCounter - Thread-safe counter
 */
export class AtomicCounter {
  private value = 0;
  private mutex = new Mutex();

  async increment(): Promise<number> {
    return this.mutex.withLock(async () => {
      this.value++;
      return this.value;
    });
  }

  async decrement(): Promise<number> {
    return this.mutex.withLock(async () => {
      this.value--;
      return this.value;
    });
  }

  async get(): Promise<number> {
    return this.mutex.withLock(async () => this.value);
  }

  async set(newValue: number): Promise<void> {
    return this.mutex.withLock(async () => {
      this.value = newValue;
    });
  }

  async compareAndSwap(expected: number, newValue: number): Promise<boolean> {
    return this.mutex.withLock(async () => {
      if (this.value === expected) {
        this.value = newValue;
        return true;
      }
      return false;
    });
  }
}

/**
 * ConcurrentMap - Thread-safe map implementation
 */
export class ConcurrentMap<K, V> {
  private map = new Map<K, V>();
  private lock = new ReadWriteLock();

  async get(key: K): Promise<V | undefined> {
    return this.lock.withReadLock(() => this.map.get(key));
  }

  async set(key: K, value: V): Promise<void> {
    return this.lock.withWriteLock(() => {
      this.map.set(key, value);
    });
  }

  async has(key: K): Promise<boolean> {
    return this.lock.withReadLock(() => this.map.has(key));
  }

  async delete(key: K): Promise<boolean> {
    return this.lock.withWriteLock(() => this.map.delete(key));
  }

  async size(): Promise<number> {
    return this.lock.withReadLock(() => this.map.size);
  }

  async clear(): Promise<void> {
    return this.lock.withWriteLock(() => {
      this.map.clear();
    });
  }

  async entries(): Promise<Array<[K, V]>> {
    return this.lock.withReadLock(() => Array.from(this.map.entries()));
  }

  async keys(): Promise<K[]> {
    return this.lock.withReadLock(() => Array.from(this.map.keys()));
  }

  async values(): Promise<V[]> {
    return this.lock.withReadLock(() => Array.from(this.map.values()));
  }

  async computeIfAbsent(key: K, mappingFunction: (key: K) => V): Promise<V> {
    return this.lock.withWriteLock(() => {
      if (!this.map.has(key)) {
        const value = mappingFunction(key);
        this.map.set(key, value);
        return value;
      }
      return this.map.get(key)!;
    });
  }
}
