# Abstract Data Types (ADT) Implementation

This document describes the systematic application of Abstract Data Type (ADT) principles in the Swift Response codebase.

## 1. Core Principles

### Abstraction
We have enforced strict separation between interface and implementation. Client code relies solely on TypeScript interfaces, hiding the underlying logic and state.

- **Interface**: Defines *what* the ADT does.
- **Implementation**: Defines *how* it does it.
- **Representation**: The internal data structures used to store the state.

### ADT Components
For each ADT, we defined:
- **Operations**: Exposed via Interface.
- **Representation**: Private fields in the class.
- **Abstraction Function (AF)**: Conceptual mapping from Rep to Abstract Value.
- **Representation Invariant (RI)**: Validity constraints on the Rep.

## 2. Implemented ADTs

### 2.1 Concurrency Primitives (`src/utils/concurrency`)

#### `ReadWriteLock`
- **Interface**: `IReadWriteLock`
- **Representation**:
  - `readers: number`: Count of active readers.
  - `writer: boolean`: Exclusive writer flag.
  - `readQueue`, `writeQueue`: Wait queues.
- **Invariant (RI)**:
  - `readers >= 0`
  - `(!writer || readers == 0)`: If write-locked, no readers allowed.
- **Abstraction Function**:
  - Represents a lock state allowing concurrent reads OR exclusive write.

#### `Mutex`
- **Interface**: `IMutex`
- **Representation**:
  - `locked: boolean`
  - `queue: Array<() => void>`
- **Invariant (RI)**:
  - `locked` must be boolean.
- **Abstraction Function**:
  - Represents a binary lock for mutual exclusion.

#### `Semaphore`
- **Interface**: `ISemaphore`
- **Representation**:
  - `permits: number`
  - `queue: Array<() => void>`
- **Invariant (RI)**:
  - Internal queue structures must be valid (not null).
- **Abstraction Function**:
  - Represents a pool of `n` available resources.

#### `AtomicCounter`
- **Interface**: `IAtomicCounter`
- **Representation**:
  - `value: number`
  - `mutex: Mutex`
- **Invariant (RI)**:
  - `value` is numeric.
  - `mutex` is initialized.
- **Abstraction Function**:
  - Represents an integer that supports atomic operations.

#### `ConcurrentMap<K, V>`
- **Interface**: `IConcurrentMap<K, V>`
- **Representation**:
  - `map: Map<K, V>`
  - `lock: ReadWriteLock`
- **Invariant (RI)**:
  - Underlying `map` and `lock` instances must be valid.
- **Abstraction Function**:
  - Represents a dictionary where all operations are thread-safe.

### 2.2 Emergency Cache (`src/utils/cache`)

#### `EmergencyRequestCache`
- **Interface**: `IEmergencyRequestCache`
- **Representation**:
  - `cache: ConcurrentMap`
  - `hitCounter`, `missCounter`, `updateCounter`: AtomicCounters
  - `lock`: ReadWriteLock
- **Invariant (RI)**:
  - All internal components must be initialized and non-null.
- **Abstraction Function**:
  - Represents the application-level cache of emergency requests with integrated statistics.

## 3. Invariant Enforcement
We use a defensive programming technique called `checkRep()` to validate Representation Invariants.

```typescript
private checkRep(): void {
  // Asserts that the RI holds true
  if (this.readers < 0) {
    throw new Error('Invariant violation: readers count cannot be negative');
  }
}
```

Calls to `checkRep()` are placed:
- At the end of constructors.
- At the end of mutator methods (e.g., `release()`, `set()`).
- At the beginning of some methods to ensure valid usage.

## 4. Testing Strategy
Testing focuses on the **observable behavior** defined in the interface, avoiding dependence on internal fields like `readers` or `queue`.

- **Preconditions**: Checked explicitly (e.g., arguments types).
- **Postconditions**: Verified by ensuring the return values match expected abstract values.
