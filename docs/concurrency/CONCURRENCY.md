# Concurrency Implementation Documentation

## Overview

This document describes the comprehensive concurrency implementation in the Swift Response emergency management system. The implementation covers three core concepts:

1. **Shared-Memory Safe Concurrency** - Thread-safe data structures with locks
2. **Message-Passing Module** - Actor-based communication and event bus
3. **Race Condition Detection & Prevention** - Monitoring and atomic operations

## Architecture

```
src/utils/concurrency/
├── sharedMemory.ts       # Locks, semaphores, concurrent data structures
├── messagePassing.ts     # Actors, channels, message queues, event bus
└── raceDetection.ts      # Race detector, transaction manager, optimistic locking

src/utils/cache/
└── emergencyCache.ts     # Thread-safe emergency request cache

src/utils/messaging/
└── emergencyEvents.ts    # Message-passing coordinator for emergency updates

src/app/volunteer/
└── page.tsx              # Integration in volunteer dashboard
```

---

## 1. Shared-Memory Safe Concurrency

### Components

#### ReadWriteLock
Allows multiple concurrent readers OR single exclusive writer.

```typescript
const lock = new ReadWriteLock();

// Multiple readers can access simultaneously
await lock.withReadLock(async () => {
  const data = await fetchData();
  return data;
});

// Writer gets exclusive access
await lock.withWriteLock(async () => {
  await updateData(newValue);
});
```

**Features:**
- Multiple readers allowed simultaneously
- Single writer gets exclusive access
- Writer preference to prevent writer starvation
- Queue management for waiting operations

#### Mutex
Mutual exclusion lock for critical sections.

```typescript
const mutex = new Mutex();

await mutex.withLock(async () => {
  // Critical section - only one thread at a time
  await performCriticalOperation();
});
```

**Features:**
- Ensures only one operation at a time
- FIFO queue for fairness
- Automatic lock release with try-finally
- Lock status checking

#### Semaphore
Counting semaphore for resource pool management.

```typescript
const semaphore = new Semaphore(5); // Allow 5 concurrent operations

await semaphore.withPermit(async () => {
  // Limited resource access
  await callRateLimitedAPI();
});
```

**Features:**
- Limit concurrent access to N operations
- Useful for rate limiting and resource pools
- Permit tracking
- Queue management for waiting operations

#### AtomicCounter
Thread-safe counter with atomic operations.

```typescript
const counter = new AtomicCounter();

await counter.increment(); // Atomic increment
await counter.decrement(); // Atomic decrement
const value = await counter.get();

// Compare-and-swap for conditional updates
const success = await counter.compareAndSwap(5, 10); // If value is 5, set to 10
```

**Features:**
- Atomic increment/decrement
- Compare-and-swap (CAS) operations
- Thread-safe read/write
- Prevents lost updates

#### ConcurrentMap
Thread-safe Map implementation.

```typescript
const map = new ConcurrentMap<string, Data>();

// Safe concurrent reads
const value = await map.get(key);

// Safe concurrent writes
await map.set(key, value);

// Compute if absent (atomic)
const value = await map.computeIfAbsent(key, (k) => createValue(k));
```

**Features:**
- Thread-safe get/set/delete
- Multiple concurrent readers
- Exclusive writer access
- Atomic computeIfAbsent for lazy initialization

---

## 2. Message-Passing Module

### Components

#### MessageQueue
FIFO message queue with priority support.

```typescript
const queue = new MessageQueue<PayloadType>();

// Register handler
queue.on('event_type', async (payload) => {
  await processEvent(payload);
});

// Send message
await queue.send('event_type', payload, priority);
```

**Features:**
- Priority-based ordering
- Asynchronous processing
- Type-safe message handlers
- Error isolation per message

#### Channel
Bidirectional communication channel (Go-style).

```typescript
const channel = new Channel<Message>();

// Sender
await channel.send(message);

// Receiver
const message = await channel.receive();

// Non-blocking try
const message = channel.tryReceive(); // Returns undefined if empty
```

**Features:**
- Blocking send/receive
- Non-blocking tryReceive
- Channel closing
- FIFO ordering

#### Actor
Autonomous entity with mailbox (Actor model).

```typescript
class MyActor extends Actor<MessageType, StateType> {
  protected setupHandlers(): void {
    this.registerHandler('process', async (msg) => {
      // Process message
      this.state = updateState(this.state, msg);
    });
  }
}

const actor = new MyActor(initialState);
await actor.tell('process', message);
```

**Features:**
- Isolated state (no shared memory)
- Message-based communication
- Type-safe handlers
- Actor identification

#### EventBus
Publish-subscribe event system.

```typescript
const eventBus = new EventBus<EventType>();

// Subscribe
const unsubscribe = eventBus.subscribe('event_name', async (event) => {
  await handleEvent(event);
});

// Publish
await eventBus.publish('event_name', eventData);

// Unsubscribe
unsubscribe();
```

**Features:**
- Multiple subscribers per event
- Async event handlers
- Error isolation
- Automatic unsubscribe

---

## 3. Race Condition Detection & Prevention

### Components

#### RaceDetector
Monitors resource access for potential race conditions.

```typescript
const detector = new RaceDetector();

// Record access
detector.recordAccess('resource-id', 'read');
detector.recordAccess('resource-id', 'write');

// Automatically detects concurrent write-write or write-read
// Logs warnings with stack traces
```

**Features:**
- Automatic race detection
- Time-window analysis (100ms default)
- Stack trace capture
- Access logging

**Detection Logic:**
- Detects concurrent writes within time window
- Detects write-read conflicts within time window
- Logs warnings with operation types and timing
- Captures stack traces for debugging

#### TransactionManager
Atomic transactions with rollback.

```typescript
const txManager = new TransactionManager(initialData);

await txManager.transaction(async (data) => {
  // Modify data
  data.value = newValue;
  
  if (error) {
    throw new Error(); // Auto-rollback
  }
  
  return result;
});
```

**Features:**
- Snapshot-based rollback
- Automatic rollback on error
- Atomic all-or-nothing semantics
- Manual rollback support

#### OptimisticLock
Version-based optimistic concurrency control.

```typescript
const lock = new OptimisticLock(initialData);

// Read with version
const { data, version } = await lock.read();

// Update with version check
const success = await lock.update(version, (data) => {
  data.value = newValue;
  return data;
});

if (!success) {
  // Another update occurred - retry or handle conflict
}
```

**Features:**
- Version-based conflict detection
- No blocking on reads
- Optimistic updates
- Automatic version incrementing

#### ConcurrentOperationTracker
Tracks ongoing operations on resources.

```typescript
const tracker = new ConcurrentOperationTracker();

const opId = 'operation-123';
await tracker.startOperation('resource-id', opId);

// ... perform operation ...

await tracker.finishOperation('resource-id', opId);

// Check if operations are active
const hasOps = await tracker.hasActiveOperations('resource-id');

// Wait until idle
await tracker.waitUntilIdle('resource-id');
```

**Features:**
- Operation lifecycle tracking
- Concurrent operation counting
- Wait-until-idle capability
- Resource-based isolation

---

## Integration Examples

### 1. EmergencyRequestCache (Shared-Memory Safe)

```typescript
// src/utils/cache/emergencyCache.ts

class EmergencyRequestCache {
  private cache = new ConcurrentMap<string, IEmergencyRequest>();
  private lock = new ReadWriteLock();
  private hitCounter = new AtomicCounter();
  
  async get(id: string): Promise<IEmergencyRequest | undefined> {
    // Race detection
    globalRaceDetector.recordAccess(`cache:${id}`, 'read');
    
    const request = await this.cache.get(id);
    
    if (request) {
      await this.hitCounter.increment(); // Thread-safe
    }
    
    return request;
  }
  
  async update(id: string, updater: Function): Promise<boolean> {
    // Exclusive write lock
    return this.lock.withWriteLock(async () => {
      globalRaceDetector.recordAccess(`cache:${id}`, 'write');
      
      const existing = await this.cache.get(id);
      if (!existing) return false;
      
      const updated = updater(existing);
      await this.cache.set(id, updated);
      
      return true;
    });
  }
}
```

**Concurrency Patterns Used:**
- ConcurrentMap for thread-safe storage
- ReadWriteLock for exclusive updates
- AtomicCounter for hit/miss tracking
- RaceDetector for monitoring

### 2. EmergencyUpdateCoordinator (Message-Passing)

```typescript
// src/utils/messaging/emergencyEvents.ts

class EmergencyUpdateCoordinator {
  private messageQueue = new MessageQueue<EmergencyUpdateEvent>();
  private notificationActor: EmergencyNotificationActor;
  private loggerActor: EmergencyLoggerActor;
  
  constructor() {
    this.notificationActor = new EmergencyNotificationActor(...);
    this.loggerActor = new EmergencyLoggerActor(...);
    
    // Fan-out pattern
    this.messageQueue.on('emergency_update', async (event) => {
      await Promise.all([
        this.notificationActor.tell('notify', event),
        this.loggerActor.tell('log', event),
      ]);
      
      await emergencyEventBus.publish('emergency_update', event);
    });
  }
}
```

**Concurrency Patterns Used:**
- Actor model for isolated processing
- MessageQueue for async event handling
- EventBus for pub/sub
- Fan-out for parallel processing

### 3. Volunteer Page Integration

```typescript
// src/app/volunteer/page.tsx

const fetchData = async (userId: string) => {
  const opId = `fetch-${Date.now()}`;
  
  try {
    // Prevent concurrent fetches (race condition prevention)
    await operationTracker.startOperation('emergency-data', opId);
    
    // Fetch from database
    const { data: requestsData } = await supabase
      .from('emergency_requests')
      .select('*');
    
    if (requestsData) {
      // Populate cache (thread-safe)
      const requests = await Promise.all(
        requestsData.map(async (req) => {
          const cached = await emergencyRequestCache.get(req.id);
          if (cached) return cached;
          
          await emergencyRequestCache.set(req.id, req);
          
          // Publish event (message-passing)
          await emergencyUpdateCoordinator.processUpdate({
            type: 'created',
            requestId: req.id,
            request: req,
            timestamp: Date.now(),
          });
          
          return req;
        })
      );
      
      setRequests(requests);
      
      // Update stats
      const stats = await emergencyRequestCache.getStats();
      setCacheStats(stats);
    }
  } finally {
    await operationTracker.finishOperation('emergency-data', opId);
  }
};

const onRegistrationSuccess = async (newReg: IVolunteerRegistration) => {
  // Atomic cache update (race condition prevention)
  await emergencyRequestCache.update(newReg.request_id, (req) => ({
    ...req,
    status: 'assigned'
  }));
  
  // Publish event (message-passing)
  await emergencyUpdateCoordinator.processUpdate({
    type: 'status_changed',
    requestId: newReg.request_id,
    oldStatus: 'pending',
    newStatus: 'assigned',
    timestamp: Date.now(),
  });
};
```

**Concurrency Patterns Used:**
- ConcurrentOperationTracker prevents race conditions
- Thread-safe cache for parallel reads
- Message-passing for event notifications
- Atomic updates for status changes

---

## UI Integration

The volunteer dashboard displays cache statistics showing the concurrency system in action:

```tsx
<div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4">
  <h3>⚡ Concurrency Cache</h3>
  <div>Cache Hits: {cacheStats.hits}</div>
  <div>Cache Misses: {cacheStats.misses}</div>
  <div>Hit Rate: {(cacheStats.hitRate * 100).toFixed(1)}%</div>
  <p>Thread-safe cache prevents race conditions</p>
</div>
```

---

## Type Safety

All concurrency modules are fully type-safe:

- **No `any` types** used anywhere
- Generic type parameters for flexibility
- Proper TypeScript interfaces
- Type inference where appropriate

Example:
```typescript
class ConcurrentMap<K, V> {
  async get(key: K): Promise<V | undefined> { ... }
  async set(key: K, value: V): Promise<void> { ... }
}

// Usage - fully typed
const map = new ConcurrentMap<string, IEmergencyRequest>();
const request: IEmergencyRequest | undefined = await map.get('id');
```

---

## Testing Concurrency

### Race Condition Testing

```typescript
// Enable race detection
globalRaceDetector.setEnabled(true);

// Perform concurrent operations
await Promise.all([
  cache.set('key', value1),
  cache.set('key', value2), // Potential race - detector will log warning
]);

// Check access log
const log = globalRaceDetector.getAccessLog('resource-id');
console.log(log); // See all accesses with timestamps
```

### Stress Testing

```typescript
// Test concurrent writes
await Promise.all(
  Array.from({ length: 100 }, (_, i) =>
    cache.set(`key${i}`, createData(i))
  )
);

// Test concurrent reads
const results = await Promise.all(
  Array.from({ length: 100 }, (_, i) =>
    cache.get(`key${i}`)
  )
);
```

---

## Performance Characteristics

### ReadWriteLock
- **Reads**: O(1) when no writers waiting
- **Writes**: O(1) when no readers/writers active
- **Memory**: O(n) where n = waiting operations

### Mutex
- **Lock**: O(1)
- **Memory**: O(n) where n = waiting operations

### ConcurrentMap
- **Read**: O(1) average
- **Write**: O(1) average
- **Memory**: O(n) where n = entries

### MessageQueue
- **Send**: O(log n) for priority insertion
- **Process**: O(1) per message
- **Memory**: O(n) where n = pending messages

### RaceDetector
- **Record**: O(1)
- **Detection**: O(m²) where m = recent accesses (limited to 10)
- **Memory**: O(k) where k = tracked resources × 100

---

## Best Practices

### 1. Always Release Locks
Use `withLock` / `withReadLock` / `withWriteLock` to ensure locks are released:

```typescript
// Good ✅
await mutex.withLock(async () => {
  await operation();
});

// Bad ❌
await mutex.acquire();
await operation();
// Forgot to release!
```

### 2. Prefer Message-Passing for Independence
Use Actors/EventBus when operations don't need to block each other:

```typescript
// Good ✅ - Independent processing
await eventBus.publish('user_registered', userData);

// Overkill ❌ - No need to block
await mutex.withLock(async () => {
  await sendEmail(userData);
});
```

### 3. Use Race Detector in Development
Enable race detection during development:

```typescript
if (process.env.NODE_ENV === 'development') {
  globalRaceDetector.setEnabled(true);
}
```

### 4. Track Long Operations
Use ConcurrentOperationTracker for operations that might conflict:

```typescript
const opId = generateId();
await tracker.startOperation('resource', opId);
try {
  await longOperation();
} finally {
  await tracker.finishOperation('resource', opId);
}
```

### 5. Use Optimistic Locking for High-Read Scenarios
When reads are frequent and conflicts rare:

```typescript
const { data, version } = await lock.read();
// ... user makes changes ...
const success = await lock.update(version, () => updatedData);
if (!success) {
  // Retry or notify user of conflict
}
```

---

## Summary

This concurrency implementation provides:

✅ **Shared-Memory Safety** - Locks, semaphores, atomic operations, concurrent data structures  
✅ **Message-Passing** - Actors, channels, event bus, message queues  
✅ **Race Detection** - Automatic monitoring, transaction support, operation tracking  
✅ **Type Safety** - No `any` types, full TypeScript support  
✅ **Real Integration** - Used in emergency request cache and event system  
✅ **Production-Ready** - Error handling, automatic cleanup, thread-safe operations

The system demonstrates advanced concurrency patterns in a real-world emergency response application.
