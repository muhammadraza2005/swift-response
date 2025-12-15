# Avoiding Debugging: Correctness by Construction

This document details the practices employed in the Swift Response codebase to minimize the need for debugging through defensive programming and rapid failure detection.

## 1. Principles

### 1.1 Fail Fast

We aim to detect bugs as close to their source as possible.

- **Why?** A bug that causes a crash immediately is easier to find than one that corrupts state and causes a crash 30 minutes later.
- **How?** Using assertions to validate inputs and state transitions.

### 1.2 Assertions vs. Error Handling

- **Assertions (`assert`)**:
  - Used for _Programmer Errors_ (logic bugs, invariant violations).
  - Should _never_ happen in a correct program.
  - Example: `readers < 0` (this is mathematically impossible if logic is correct).
- **Exceptions / Error Handling**:
  - Used for _Runtime Errors_ (network down, bad user input).
  - Expected generic failures.
  - Example: `file not found` or `invalid email format`.

## 2. Implementation

### 2.1 Centralized Assertion Utility (`src/utils/debug/assert.ts`)

We provide a standardized module for assertions:

- `assert(condition, message)`: Generic assertion.
- `assertNonNull(value)`: Checks for null/undefined.
- `assertInvariant(condition)`: Specific semantic alias for `checkRep` methods.
- `assertUnreachable(value)`: For exhaustive type checking.

### 2.2 Invariant Enforcement

We use the pattern of `checkRep()` methods calling `assertInvariant()`.

```typescript
private checkRep(): void {
  assertInvariant(this.readers >= 0, 'readers count cannot be negative');
}
```

This ensures that if a concurrency bug ever causes `readers` to go negative, the program halts _immediately_ inside the method that caused it, rather than silently continuing.

### 2.3 Bug Localization

By placing assertions at the **Preconditions** (entry) and **Postconditions** (exit) of complex methods, we narrow the search space for bugs.

- If a Precondition fails: The _caller_ is buggy.
- If a Postcondition fails: The _method itself_ is buggy.

## 3. Benefits

- **Reduced Debugging Time**: The error message tells you exactly _what_ is wrong and _where_.
- **Documentation**: Assertions act as executable documentation of assumptions.
- **Reliability**: Prevents the system from running in an undefined state.
