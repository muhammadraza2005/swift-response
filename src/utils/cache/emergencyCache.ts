/**
 * Emergency Request Cache - Demonstrates shared-memory safe concurrency
 * 
 * ADT Implementation:
 * - Implements IEmergencyRequestCache interface
 * - Enforces Representation Invariants
 * - Hides internal state (cache, lock, counters)
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
   * Get request from cache
   */
  async get(id: string): Promise<IEmergencyRequest | undefined> {
    globalRaceDetector.recordAccess(`cache:${id}`, 'read');
    
    const request = await this.cache.get(id);
    
    if (request) {
      await this.hitCounter.increment();
    } else {
      await this.missCounter.increment();
    }
    
    this.checkRep();
    return request;
  }

  /**
   * Set request in cache
   */
  async set(id: string, request: IEmergencyRequest): Promise<void> {
    globalRaceDetector.recordAccess(`cache:${id}`, 'write');
    
    await this.cache.set(id, request);
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
          const request = await this.get(id);
          if (request) {
            results.set(id, request);
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
      
      const updated = updater(existing);
      await this.cache.set(id, updated);
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
   * Get cache statistics
   */
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

  /**
   * Get all cached entries
   */
  async getAllEntries(): Promise<IEmergencyRequest[]> {
    const entries = await this.cache.entries();
    return entries.map(([_, request]) => request);
  }

  /**
   * Check if cache has any data
   */
  async hasData(): Promise<boolean> {
    const size = await this.cache.size();
    return size > 0;
  }
}

/**
 * Global shared cache instance
 */
export const emergencyRequestCache = new EmergencyRequestCache();
