# Concurrency Quick Start Guide

## Overview
The Swift Response app implements three concurrency concepts:
1. **Shared-Memory Safe Concurrency** - Thread-safe data structures
2. **Message-Passing** - Actor-based communication
3. **Race Detection** - Automatic monitoring and prevention

---

## Where to Find It

### Core Modules
- `src/utils/concurrency/sharedMemory.ts` - Locks and concurrent data structures
- `src/utils/concurrency/messagePassing.ts` - Actors, channels, and event bus
- `src/utils/concurrency/raceDetection.ts` - Race detection and prevention

### Real Implementations
- `src/utils/cache/emergencyCache.ts` - Thread-safe cache using shared-memory patterns
- `src/utils/messaging/emergencyEvents.ts` - Message-passing coordinator with actors
- `src/app/volunteer/page.tsx` - Integration in volunteer dashboard

---

## Quick Examples

### 1. Thread-Safe Cache (Shared-Memory)

```typescript
import { emergencyRequestCache } from '@/utils/cache/emergencyCache';

// Get from cache (thread-safe read)
const request = await emergencyRequestCache.get(requestId);

// Set in cache (thread-safe write)
await emergencyRequestCache.set(requestId, request);

// Atomic update (prevents race conditions)
await emergencyRequestCache.update(requestId, (req) => ({
  ...req,
  status: 'assigned'
}));

// Get statistics
const stats = await emergencyRequestCache.getStats();
console.log(`Hit rate: ${stats.hitRate * 100}%`);
```

### 2. Message-Passing (Event System)

```typescript
import { emergencyUpdateCoordinator } from '@/utils/messaging/emergencyEvents';

// Process update through message queue
await emergencyUpdateCoordinator.processUpdate({
  type: 'created',
  requestId: request.id,
  request: request,
  timestamp: Date.now(),
});

// Subscribe to updates
const unsubscribe = emergencyUpdateCoordinator.subscribe((event) => {
  console.log(`Event: ${event.type} for ${event.requestId}`);
});
```

### 3. Race Detection

```typescript
import { globalRaceDetector, ConcurrentOperationTracker } from '@/utils/concurrency/raceDetection';

// Enable race detection (development mode)
globalRaceDetector.setEnabled(true);

// Track operations to prevent races
const tracker = new ConcurrentOperationTracker();
const opId = `op-${Date.now()}`;

await tracker.startOperation('resource-id', opId);
try {
  await performOperation();
} finally {
  await tracker.finishOperation('resource-id', opId);
}

// Wait until no operations are active
await tracker.waitUntilIdle('resource-id');
```

---

## Where It's Used

### Volunteer Dashboard (`src/app/volunteer/page.tsx`)

**Shared-Memory Safe:**
- Cache for emergency requests (ConcurrentMap + ReadWriteLock)
- Atomic counters for hit/miss tracking
- Operation tracking to prevent concurrent fetches

**Message-Passing:**
- Event bus for emergency updates
- Actors for notifications and logging
- Message queue for async processing

**Race Detection:**
- Automatic monitoring of cache access
- Operation tracking for data fetches
- Prevents concurrent writes to shared state

### Visual Indicator
The volunteer dashboard shows cache statistics in real-time:
```
⚡ Concurrency Cache
Cache Hits: 15
Cache Misses: 3
Hit Rate: 83.3%
```

---

## Testing Concurrency

### Run Race Detection
```typescript
// In development, race detector logs warnings automatically
if (process.env.NODE_ENV === 'development') {
  globalRaceDetector.setEnabled(true);
}

// Check access log for a resource
const log = globalRaceDetector.getAccessLog('resource-id');
console.log(log);
```

### Stress Test Cache
```typescript
// Test concurrent reads (should be fast)
await Promise.all(
  Array.from({ length: 100 }, (_, i) =>
    emergencyRequestCache.get(`request-${i}`)
  )
);

// Test concurrent writes (protected by locks)
await Promise.all(
  Array.from({ length: 100 }, (_, i) =>
    emergencyRequestCache.set(`request-${i}`, createRequest(i))
  )
);
```

---

## Key Features

✅ **No `any` types** - Fully type-safe  
✅ **Real implementation** - Powers volunteer dashboard  
✅ **Production-ready** - Error handling and cleanup  
✅ **Visual feedback** - Cache stats in UI  
✅ **Automatic detection** - Race condition warnings  

---

## Learn More

See [CONCURRENCY.md](./CONCURRENCY.md) for comprehensive documentation including:
- Detailed API reference
- Architecture diagrams
- Performance characteristics
- Best practices
- Integration examples

---

## Summary

The concurrency system provides:

**Shared-Memory Safe Concurrency:**
- ReadWriteLock (multiple readers OR single writer)
- Mutex (critical sections)
- Semaphore (resource pools)
- AtomicCounter (thread-safe counting)
- ConcurrentMap (thread-safe Map)

**Message-Passing:**
- MessageQueue (priority queues)
- Channel (bidirectional communication)
- Actor (isolated state + mailbox)
- EventBus (pub/sub)

**Race Detection:**
- RaceDetector (automatic monitoring)
- TransactionManager (atomic operations)
- OptimisticLock (version-based)
- ConcurrentOperationTracker (operation lifecycle)

All integrated into the emergency request cache and event system with visual feedback in the volunteer dashboard.
