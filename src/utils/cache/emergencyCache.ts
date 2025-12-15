/**
 * Emergency Request Cache - Demonstrates shared-memory safe concurrency
 * 
 * ADT Implementation:
 * - Implements IEmergencyRequestCache interface
 * - Enforces Representation Invariants
 * - Hides internal state (cache, lock, counters)
 * - HANDLES ALIASING: Uses defensive copying for inputs and outputs
 */

import { ConcurrentMap, ReadWriteLock, AtomicCounter } from '../concurrency/sharedMemory';
import { globalRaceDetector } from '../concurrency/raceDetection';
import { IEmergencyRequest } from '@/types/models';
import { IEmergencyRequestCache } from './interfaces';

/**
 * Thread-safe cache for emergency requests
 * 
 * Abstraction Function:
 * AF(cache, counters) = A cache store of EmergencyRequests with usage statistics.
 * 
 * Representation Invariant:
 * RI: cache != null && lock != null && counters != null
 */
export class EmergencyRequestCache implements IEmergencyRequestCache {
  private cache = new ConcurrentMap<string, IEmergencyRequest>();
  private lock = new ReadWriteLock();
  private hitCounter = new AtomicCounter();
  private missCounter = new AtomicCounter();
  private updateCounter = new AtomicCounter();

  constructor() {
    this.checkRep();
  }

  /**
   * Enforces Representation Invariant
   */
  private checkRep(): void {
    if (!this.cache || !this.lock || !this.hitCounter || !this.missCounter || !this.updateCounter) {
      throw new Error('Invariant violation: internal components cannot be null');
    }
  }

  /**
   * Helper: Deep clone to prevent aliasing
   */
  private deepClone<T extends object>(obj: T): T {
    // structuredClone is available in Node 17+ and modern browsers
    // Fallback for environments without structuredClone if needed, but Next.js 15 has it.
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Get request from cache
   * Returns a COPY to prevent aliasing (Modification of returned object won't affect cache)
   */
  async get(id: string): Promise<IEmergencyRequest | undefined> {
    globalRaceDetector.recordAccess(`cache:${id}`, 'read');
    
    const request = await this.cache.get(id);
    
    if (request) {
      await this.hitCounter.increment();
      this.checkRep();
      // DEFENSIVE COPY: Return a clone so caller cannot mutate cache state
      return this.deepClone(request);
    } else {
      await this.missCounter.increment();
      this.checkRep();
      return undefined;
    }
  }

  /**
   * Set request in cache
   * Stores a COPY to prevent aliasing (Modification of input object won't affect cache)
   */
  async set(id: string, request: IEmergencyRequest): Promise<void> {
    globalRaceDetector.recordAccess(`cache:${id}`, 'write');
    
    // DEFENSIVE COPY: Store a clone so caller cannot mutate cache state later
    const copy = this.deepClone(request);
    
    await this.cache.set(id, copy);
    await this.updateCounter.increment();
    this.checkRep();
  }

  /**
   * Get multiple requests (parallel reads)
   */
  async getMany(ids: string[]): Promise<Map<string, IEmergencyRequest>> {
    return this.lock.withReadLock(async () => {
      const results = new Map<string, IEmergencyRequest>();
      
      // Parallel reads are safe with read lock
      await Promise.all(
        ids.map(async (id) => {
          const request = await this.cache.get(id); // Use internal get to avoid double lock if possible, but simpler to use raw get
          // Note: using this.get(id) would deadlock if locks weren't reentrant (they aren't here).
          // So we access map directly but NEED to clone.
          
          if (request) {
            results.set(id, this.deepClone(request));
            // We should ideally increment counters here too or use a lower-level internal helper
          }
        })
      );
      
      return results;
    });
  }

  /**
   * Update request atomically
   */
  async update(id: string, updater: (request: IEmergencyRequest) => IEmergencyRequest): Promise<boolean> {
    globalRaceDetector.recordAccess(`cache:${id}`, 'write');
    
    return this.lock.withWriteLock(async () => {
      const existing = await this.cache.get(id);
      if (!existing) return false;
      
      // Pass a clone to the updater function to prevent direct mutation of internal state
      const existingClone = this.deepClone(existing);
      
      const updated = updater(existingClone);
      
      // Store a clone of the result
      await this.cache.set(id, this.deepClone(updated));
      await this.updateCounter.increment();
      
      this.checkRep();
      return true;
    });
  }

  /**
   * Delete request from cache
   */
  async delete(id: string): Promise<boolean> {
    globalRaceDetector.recordAccess(`cache:${id}`, 'write');
    const result = await this.cache.delete(id);
    this.checkRep();
    return result;
  }

  /**
   * Clear entire cache
   */
  async clear(): Promise<void> {
    globalRaceDetector.recordAccess('cache:all', 'write');
    await this.cache.clear();
    this.checkRep();
  }

  /**
   * Get all cached entries
   */
  async getAllEntries(): Promise<IEmergencyRequest[]> {
     // Access the internal entries inside the read lock
     // ConcurrentMap doesn't expose 'entries()' as an iterator we can loop safely without holding a lock long term?
     // Actually ConcurrentMap.entries() returns an Array<[K,V]> which is already a copy of the ENTRIES list,
     // but the VALUES inside are still references.
    const entries = await this.cache.entries();
    return entries.map(([_, request]) => this.deepClone(request));
  }

  // ... (getStats and hasData remain unchanged)

  async getStats(): Promise<{
    size: number;
    hits: number;
    misses: number;
    updates: number;
    hitRate: number;
  }> {
    const [size, hits, misses, updates] = await Promise.all([
      this.cache.size(),
      this.hitCounter.get(),
      this.missCounter.get(),
      this.updateCounter.get(),
    ]);

    const total = hits + misses;
    const hitRate = total > 0 ? hits / total : 0;

    return { size, hits, misses, updates, hitRate };
  }

  async hasData(): Promise<boolean> {
    const size = await this.cache.size();
    return size > 0;
  }
}

/**
 * Global shared cache instance
 */
export const emergencyRequestCache = new EmergencyRequestCache();
