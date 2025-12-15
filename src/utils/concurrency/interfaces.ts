/**
 * ADT Interfaces for Concurrency Module
 * Defines the abstract behavior separate from implementation.
 */

// Basic lock interface
export interface ILock {
    acquire(): Promise<void>;
    release(): void;
    withLock<T>(fn: () => Promise<T> | T): Promise<T>;
    isLocked?(): boolean;
}

// ReadWriteLock interface
export interface IReadWriteLock {
    acquireRead(): Promise<void>;
    releaseRead(): void;
    acquireWrite(): Promise<void>;
    releaseWrite(): void;
    withReadLock<T>(fn: () => Promise<T> | T): Promise<T>;
    withWriteLock<T>(fn: () => Promise<T> | T): Promise<T>;
}

// Semaphore interface
export interface ISemaphore {
    acquire(): Promise<void>;
    release(): void;
    withPermit<T>(fn: () => Promise<T> | T): Promise<T>;
    availablePermits(): number;
}

// AtomicCounter interface
export interface IAtomicCounter {
    increment(): Promise<number>;
    decrement(): Promise<number>;
    get(): Promise<number>;
    set(newValue: number): Promise<void>;
    compareAndSwap(expected: number, newValue: number): Promise<boolean>;
}

// ConcurrentMap interface
export interface IConcurrentMap<K, V> {
    get(key: K): Promise<V | undefined>;
    set(key: K, value: V): Promise<void>;
    has(key: K): Promise<boolean>;
    delete(key: K): Promise<boolean>;
    size(): Promise<number>;
    clear(): Promise<void>;
    entries(): Promise<Array<[K, V]>>;
    keys(): Promise<K[]>;
    values(): Promise<V[]>;
    computeIfAbsent(key: K, mappingFunction: (key: K) => V): Promise<V>;
}
