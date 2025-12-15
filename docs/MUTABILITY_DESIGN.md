# Mutability, Immutability, and Aliasing

This document details the analysis and application of state management principles in the Swift Response codebase.

## 1. Concepts

### Mutability vs. Immutability

- **Mutable Object**: State can be modified after creation. Useful for performance and modeling entities that change over time (e.g., a cache).
- **Immutable Object**: State cannot changes once created. Useful for safety, concurrency, and predictable behavior (e.g., ADT values like `Location` or `ASTNode`).

### Aliasing

Aliasing occurs when two or more references point to the same object.

- **Risk**: One part of the code ("Alice") changes the object, unexpectedly affecting another part ("Bob") that holds a reference to it.
- **Solution**: Defensive Copying.

## 2. Implementations

### 2.1 Defensive Copying in Cache (`src/utils/cache/emergencyCache.ts`)

The `EmergencyRequestCache` is a mutable container (ADT), but the objects it stores (`IEmergencyRequest`) are effectively treated as data values.

**Problem**: If `get()` returns a direct reference to the internal map value:

```typescript
const req = cache.get("1");
req.status = "resolved"; // Modifies the cache WITHOUT acquiring locks!
```

This violates the ADT invariants and thread safety.

**Solution**:
We implemented **Defensive Copying** using `structuredClone` (or JSON fallback).

- **Input**: `set(id, req)` stores a copy of `req`.
- **Output**: `get(id)` returns a copy of the stored request.

This ensures strict encapsulation.

### 2.2 Immutable Collections (`src/utils/collections/immutable.ts`)

We introduced `ImmutableList<T>` to demonstrate purely immutable design.

- **State**: `readonly data: ReadonlyArray<T>`.
- **Mutation**: Operations like `add` or `remove` return a **new instance** of `ImmutableList`, leaving the original untouched.
- **Iteration**: Iterators are inherently safe because the underlying data never changes during the iterator's lifespan.

### 2.3 Resilient Iteration

For mutable contexts, we demonstrated the **Snapshot Pattern** in `ResilientIterator`.

- **Strategy**: Copy the collection at the moment iteration starts.
- **Trade-off**: Higher memory usage vs. Safety (prevents Concurrent Modification issues).

## 3. Specifications and Contracts

We enforce these principles via specifications:

- **@modifies**: Docstrings explicitly state if a method modifies `this` or its arguments.
- **@returns**: Docstrings specify if a return value is a new object (safe) or a reference (handle with care).

Example from `EmergencyRequestCache.ts`:

```typescript
/**
 * Get request from cache
 * Returns a COPY to prevent aliasing (Modification of returned object won't affect cache)
 */
async get(id: string): Promise<IEmergencyRequest | undefined>
```
