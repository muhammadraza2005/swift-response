/**
 * Concurrency Module - Shared-Memory Safe Operations
 * Implements thread-safe patterns for concurrent data access
 * 
 * Demonstrates ADT principles:
 * - Separation of Interface and Implementation
 * - Representation Invariants (RI)
 * - Abstraction Functions (AF)
 * - Invariant Enforcement (checkRep)
 */

import { 
  IReadWriteLock, 
  IMutex, 
  ISemaphore, 
  IAtomicCounter, 
  IConcurrentMap 
} from './interfaces';

// Re-export interfaces for consumers
export type { IReadWriteLock, IMutex, ISemaphore, IAtomicCounter, IConcurrentMap };

/**
 * ReadWriteLock - Allows multiple readers or single writer
 * 
 * Abstraction Function:
 * AF(readers, writer) = A lock state that is 'write-locked' if writer is true,
 *                       'read-locked' by N readers if readers = N > 0,
 *                       or 'unlocked' otherwise.
 * 
 * Representation Invariant:
 * RI: readers >= 0
 *     && (!writer || readers === 0) // If writer is true, readers must be 0
 */
export class ReadWriteLock implements IReadWriteLock {
  private readers = 0;
  private writer = false;
  private writeQueue: Array<() => void> = [];
  private readQueue: Array<() => void> = [];

  constructor() {
    this.checkRep();
  }

  /**
   * Enforces the Representation Invariant
   * Throws error if invariant is violated
   */
  private checkRep(): void {
    if (this.readers < 0) {
      throw new Error('Invariant violation: readers count cannot be negative');
    }
    if (this.writer && this.readers > 0) {
      throw new Error('Invariant violation: cannot have both writer and readers');
    }
  }

  async acquireRead(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.writer && this.writeQueue.length === 0) {
        this.readers++;
        this.checkRep();
        resolve();
      } else {
        this.readQueue.push(() => {
          this.readers++;
          this.checkRep();
          resolve();
        });
      }
    });
  }

  releaseRead(): void {
    this.readers--;
    this.checkRep();
    
    if (this.readers === 0 && this.writeQueue.length > 0) {
      this.writer = true;
      const writer = this.writeQueue.shift();
      writer?.();
      this.checkRep();
    }
  }

  async acquireWrite(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.writer && this.readers === 0) {
        this.writer = true;
        this.checkRep();
        resolve();
      } else {
        this.writeQueue.push(() => {
          this.writer = true;
          this.checkRep();
          resolve();
        });
      }
    });
  }

  releaseWrite(): void {
    this.writer = false;
    this.checkRep();
    
    // Process waiting writers first (writer preference)
    if (this.writeQueue.length > 0) {
      const writer = this.writeQueue.shift();
      this.writer = true; // Set directly before callback to maintain RI if callback checks
      writer?.();
      this.checkRep();
    } else {
      // Allow all waiting readers
      while (this.readQueue.length > 0) {
        const reader = this.readQueue.shift();
        reader?.();
      }
      this.checkRep();
    }
  }

  async withReadLock<T>(fn: () => Promise<T> | T): Promise<T> {
    await this.acquireRead();
    try {
      return await fn();
    } finally {
      this.releaseRead();
    }
  }

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
 * 
 * Abstraction Function:
 * AF(locked) = A binary semaphore state (locked/unlocked)
 * 
 * Representation Invariant:
 * RI: locked is boolean
 */
export class Mutex implements IMutex {
  private locked = false;
  private queue: Array<() => void> = [];

  constructor() {
    this.checkRep();
  }

  private checkRep(): void {
    if (typeof this.locked !== 'boolean') {
      throw new Error('Invariant violation: locked state must be boolean');
    }
  }

  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.locked) {
        this.locked = true;
        this.checkRep();
        resolve();
      } else {
        this.queue.push(() => {
          this.locked = true;
          this.checkRep();
          resolve();
        });
      }
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next?.();
      // locked remains true as ownership passes
    } else {
      this.locked = false;
    }
    this.checkRep();
  }

  async withLock<T>(fn: () => Promise<T> | T): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  isLocked(): boolean {
    return this.locked;
  }
}

/**
 * Semaphore - Counting semaphore for resource pool management
 * 
 * Abstraction Function:
 * AF(permits) = A pool of 'permits' available resources
 * 
 * Representation Invariant:
 * RI: queue is not null
 */
export class Semaphore implements ISemaphore {
  private permits: number;
  private queue: Array<() => void> = [];

  constructor(initialPermits: number) {
    this.permits = initialPermits;
    this.checkRep();
  }

  private checkRep(): void {
    if (!this.queue) {
      throw new Error('Invariant violation: queue cannot be null');
    }
  }

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
      this.checkRep();
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next?.();
    } else {
      this.permits++;
    }
    this.checkRep();
  }

  async withPermit<T>(fn: () => Promise<T> | T): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  availablePermits(): number {
    return this.permits;
  }
}

/**
 * AtomicCounter - Thread-safe counter
 * 
 * Abstraction Function:
 * AF(value) = The integer value
 * 
 * Representation Invariant:
 * RI: value is a number and mutex is not null
 */
export class AtomicCounter implements IAtomicCounter {
  private value = 0;
  private mutex = new Mutex();

  constructor() {
    this.checkRep();
  }

  private checkRep(): void {
    if (typeof this.value !== 'number') {
      throw new Error('Invariant violation: value must be a number');
    }
    if (!this.mutex) {
      throw new Error('Invariant violation: mutex cannot be null');
    }
  }

  async increment(): Promise<number> {
    return this.mutex.withLock(async () => {
      this.value++;
      this.checkRep();
      return this.value;
    });
  }

  async decrement(): Promise<number> {
    return this.mutex.withLock(async () => {
      this.value--;
      this.checkRep();
      return this.value;
    });
  }

  async get(): Promise<number> {
    return this.mutex.withLock(async () => this.value);
  }

  async set(newValue: number): Promise<void> {
    return this.mutex.withLock(async () => {
      this.value = newValue;
      this.checkRep();
    });
  }

  async compareAndSwap(expected: number, newValue: number): Promise<boolean> {
    return this.mutex.withLock(async () => {
      if (this.value === expected) {
        this.value = newValue;
        this.checkRep();
        return true;
      }
      return false;
    });
  }
}

/**
 * ConcurrentMap - Thread-safe map implementation
 * 
 * Abstraction Function:
 * AF(map) = A dictionary mapping keys K to values V
 * 
 * Representation Invariant:
 * RI: map is instance of Map, lock is instance of ReadWriteLock
 */
export class ConcurrentMap<K, V> implements IConcurrentMap<K, V> {
  private map = new Map<K, V>();
  private lock = new ReadWriteLock();

  constructor() {
    this.checkRep();
  }

  private checkRep(): void {
    if (!(this.map instanceof Map)) {
      throw new Error('Invariant violation: underlying storage must be a Map');
    }
    if (!(this.lock instanceof ReadWriteLock)) {
      throw new Error('Invariant violation: lock must be a ReadWriteLock');
    }
  }

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
