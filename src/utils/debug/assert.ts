/**
 * Debugging and Assertion Utility
 * 
 * Purpose: Provide mechanisms to enforce correctness by construction and localize bugs.
 * 
 * Philosophy:
 * - Assertions are for PROGRAMMER ERRORS (internal invariants, impossible states).
 * - Exceptions are for RUNTIME ERRORS (bad user input, network failure).
 * - Validating assumptions early (Fail Fast) prevents hard-to-debug cascading failures.
 */

class AssertionError extends Error {
  constructor(message: string) {
    super(`Assertion Failed: ${message}`);
    this.name = 'AssertionError';
  }
}

/**
 * Asserts that a condition is true.
 * Use this to document and enforce assumptions about program state.
 * 
 * @param condition The boolean condition that must be true
 * @param message Message to explain what went wrong
 */
export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new AssertionError(message);
  }
}

/**
 * Asserts that a value is not null or undefined.
 * Useful for checking internal state that should have been initialized.
 */
export function assertNonNull<T>(value: T | null | undefined, message: string = 'Value expected to be non-null'): asserts value is T {
  if (value === null || value === undefined) {
    throw new AssertionError(message);
  }
}

/**
 * Asserts that a code path should be unreachable.
 * Use in 'default' cases of exhaustive switches or impossible branches.
 */
export function assertUnreachable(x: never, message: string = 'Unreachable code executed'): never {
  throw new AssertionError(message);
}

/**
 * Asserts a representation invariant.
 * Semantic alias for assert, specific to ADT invariant checks.
 */
export function assertInvariant(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new AssertionError(`Invariant Violation: ${message}`);
  }
}
