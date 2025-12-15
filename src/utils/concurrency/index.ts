/**
 * Concurrency Module Index
 * 
 * This module provides comprehensive concurrency support for the Swift Response
 * emergency management system. It includes three core areas:
 * 
 * 1. Shared-Memory Safe Concurrency
 *    - ReadWriteLock: Multiple readers OR single writer
 *    - Mutex: Mutual exclusion for critical sections
 *    - Semaphore: Resource pool management
 *    - AtomicCounter: Thread-safe counter with CAS
 *    - ConcurrentMap: Thread-safe Map implementation
 * 
 * 2. Message-Passing Module
 *    - MessageQueue: Priority message queue with handlers
 *    - Channel: Bidirectional communication (Go-style)
 *    - Actor: Autonomous entities with mailboxes
 *    - EventBus: Publish-subscribe event system
 * 
 * 3. Race Condition Detection & Prevention
 *    - RaceDetector: Monitors and detects race conditions
 *    - TransactionManager: Atomic transactions with rollback
 *    - OptimisticLock: Version-based optimistic concurrency
 *    - ConcurrentOperationTracker: Tracks ongoing operations
 * 
 * @module concurrency
 */

// Shared-Memory Safe Concurrency
export {
  ReadWriteLock,
  Mutex,
  Semaphore,
  AtomicCounter,
  ConcurrentMap,
} from './sharedMemory';

// Message-Passing Module
export type {
  MessageHandler,
  Message,
} from './messagePassing';

export {
  MessageQueue,
  Channel,
  Actor,
  EventBus,
} from './messagePassing';

// Race Condition Detection & Prevention
export {
  RaceDetector,
  TransactionManager,
  OptimisticLock,
  ConcurrentOperationTracker,
  globalRaceDetector,
} from './raceDetection';

/**
 * Usage Examples:
 * 
 * // Shared-Memory Safe Operations
 * const lock = new ReadWriteLock();
 * await lock.withReadLock(async () => {
 *   const data = await fetchData();
 *   return data;
 * });
 * 
 * const mutex = new Mutex();
 * await mutex.withLock(async () => {
 *   await criticalSection();
 * });
 * 
 * const counter = new AtomicCounter();
 * await counter.increment();
 * 
 * const map = new ConcurrentMap<string, Data>();
 * await map.set('key', value);
 * const value = await map.get('key');
 * 
 * // Message-Passing
 * const queue = new MessageQueue<Event>();
 * queue.on('event_type', async (event) => {
 *   await handleEvent(event);
 * });
 * await queue.send('event_type', eventData);
 * 
 * const channel = new Channel<Message>();
 * await channel.send(message);
 * const received = await channel.receive();
 * 
 * const eventBus = new EventBus<Event>();
 * const unsubscribe = eventBus.subscribe('event', handler);
 * await eventBus.publish('event', data);
 * 
 * // Race Detection & Prevention
 * globalRaceDetector.recordAccess('resource-id', 'write');
 * 
 * const txManager = new TransactionManager(initialData);
 * await txManager.transaction(async (data) => {
 *   data.value = newValue;
 *   return result;
 * });
 * 
 * const optimisticLock = new OptimisticLock(data);
 * const { data, version } = await optimisticLock.read();
 * const success = await optimisticLock.update(version, (d) => updatedData);
 * 
 * const tracker = new ConcurrentOperationTracker();
 * await tracker.startOperation('resource', 'op-id');
 * await tracker.finishOperation('resource', 'op-id');
 * await tracker.waitUntilIdle('resource');
 */
