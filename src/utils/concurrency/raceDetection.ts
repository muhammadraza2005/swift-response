/**
 * Race Condition Detection & Prevention Module
 * Implements patterns to detect and prevent race conditions
 */

import { Mutex } from './sharedMemory';

/**
 * RaceDetector - Detects potential race conditions
 */
export class RaceDetector {
  private accessLog = new Map<string, Array<{ operation: 'read' | 'write'; timestamp: number; stackTrace: string }>>();
  private enabled = true;

  /**
   * Record an access to a resource
   */
  recordAccess(resourceId: string, operation: 'read' | 'write'): void {
    if (!this.enabled) return;

    const stackTrace = new Error().stack || '';
    const timestamp = Date.now();

    if (!this.accessLog.has(resourceId)) {
      this.accessLog.set(resourceId, []);
    }

    const log = this.accessLog.get(resourceId)!;
    log.push({ operation, timestamp, stackTrace });

    // Keep only recent accesses (last 100)
    if (log.length > 100) {
      log.shift();
    }

    // Check for potential race condition
    this.detectRace(resourceId);
  }

  /**
   * Detect potential race conditions
   */
  private detectRace(resourceId: string): void {
    const log = this.accessLog.get(resourceId);
    if (!log || log.length < 2) return;

    const recent = log.slice(-10);
    const now = Date.now();
    const timeWindow = 100; // ms

    // Check for concurrent writes or write-read within time window
    for (let i = 0; i < recent.length - 1; i++) {
      for (let j = i + 1; j < recent.length; j++) {
        const access1 = recent[i];
        const access2 = recent[j];
        const timeDiff = Math.abs(access2.timestamp - access1.timestamp);

        if (timeDiff < timeWindow) {
          if (access1.operation === 'write' || access2.operation === 'write') {
            console.warn(`⚠️ Potential race condition detected on resource: ${resourceId}`);
            console.warn(`Operations: ${access1.operation} and ${access2.operation}`);
            console.warn(`Time difference: ${timeDiff}ms`);
            console.warn('Stack traces:', { access1: access1.stackTrace, access2: access2.stackTrace });
          }
        }
      }
    }
  }

  /**
   * Enable/disable race detection
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Clear access logs
   */
  clear(): void {
    this.accessLog.clear();
  }

  /**
   * Get access log for a resource
   */
  getAccessLog(resourceId: string): Array<{ operation: 'read' | 'write'; timestamp: number }> {
    return (this.accessLog.get(resourceId) || []).map(({ operation, timestamp }) => ({
      operation,
      timestamp,
    }));
  }
}

/**
 * TransactionManager - Ensures atomic operations
 */
export class TransactionManager<T> {
  private mutex = new Mutex();
  private data: T;
  private snapshots: T[] = [];

  constructor(initialData: T) {
    this.data = this.deepClone(initialData);
  }

  /**
   * Execute a transaction atomically
   */
  async transaction<R>(fn: (data: T) => Promise<R> | R): Promise<R> {
    return this.mutex.withLock(async () => {
      // Create snapshot
      const snapshot = this.deepClone(this.data);
      this.snapshots.push(snapshot);

      try {
        const result = await fn(this.data);
        // Transaction succeeded, discard snapshot
        this.snapshots.pop();
        return result;
      } catch (error) {
        // Transaction failed, rollback
        this.data = this.snapshots.pop()!;
        throw error;
      }
    });
  }

  /**
   * Get current data (readonly)
   */
  async read(): Promise<Readonly<T>> {
    return this.mutex.withLock(async () => this.deepClone(this.data));
  }

  /**
   * Manually rollback to previous state
   */
  async rollback(): Promise<void> {
    return this.mutex.withLock(async () => {
      if (this.snapshots.length > 0) {
        this.data = this.snapshots.pop()!;
      }
    });
  }

  private deepClone(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}

/**
 * OptimisticLock - Versioned optimistic concurrency control
 */
export class OptimisticLock<T extends { version?: number }> {
  private data: T;
  private mutex = new Mutex();

  constructor(initialData: T) {
    this.data = { ...initialData, version: 0 };
  }

  /**
   * Read data with version
   */
  async read(): Promise<{ data: Readonly<T>; version: number }> {
    return this.mutex.withLock(async () => ({
      data: { ...this.data },
      version: this.data.version || 0,
    }));
  }

  /**
   * Update data with version check
   */
  async update(expectedVersion: number, updater: (data: T) => T | Promise<T>): Promise<boolean> {
    return this.mutex.withLock(async () => {
      if ((this.data.version || 0) !== expectedVersion) {
        // Version mismatch - another update occurred
        return false;
      }

      const updated = await updater({ ...this.data });
      this.data = {
        ...updated,
        version: (this.data.version || 0) + 1,
      };
      return true;
    });
  }

  /**
   * Force update (ignores version)
   */
  async forceUpdate(updater: (data: T) => T | Promise<T>): Promise<void> {
    return this.mutex.withLock(async () => {
      const updated = await updater({ ...this.data });
      this.data = {
        ...updated,
        version: (this.data.version || 0) + 1,
      };
    });
  }
}

/**
 * ConcurrentOperationTracker - Tracks ongoing operations
 */
export class ConcurrentOperationTracker {
  private operations = new Map<string, Set<string>>();
  private mutex = new Mutex();

  /**
   * Start tracking an operation
   */
  async startOperation(resourceId: string, operationId: string): Promise<void> {
    return this.mutex.withLock(async () => {
      if (!this.operations.has(resourceId)) {
        this.operations.set(resourceId, new Set());
      }
      this.operations.get(resourceId)!.add(operationId);
    });
  }

  /**
   * Finish tracking an operation
   */
  async finishOperation(resourceId: string, operationId: string): Promise<void> {
    return this.mutex.withLock(async () => {
      const ops = this.operations.get(resourceId);
      if (ops) {
        ops.delete(operationId);
        if (ops.size === 0) {
          this.operations.delete(resourceId);
        }
      }
    });
  }

  /**
   * Check if resource has active operations
   */
  async hasActiveOperations(resourceId: string): Promise<boolean> {
    return this.mutex.withLock(async () => {
      const ops = this.operations.get(resourceId);
      return (ops?.size ?? 0) > 0;
    });
  }

  /**
   * Get count of active operations on resource
   */
  async getOperationCount(resourceId: string): Promise<number> {
    return this.mutex.withLock(async () => {
      return this.operations.get(resourceId)?.size ?? 0;
    });
  }

  /**
   * Wait until no operations are active on resource
   */
  async waitUntilIdle(resourceId: string, pollInterval: number = 100): Promise<void> {
    while (await this.hasActiveOperations(resourceId)) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
}

/**
 * Global race detector instance
 */
export const globalRaceDetector = new RaceDetector();
