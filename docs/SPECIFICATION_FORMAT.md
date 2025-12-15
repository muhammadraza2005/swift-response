# Method Specification Practices

This document defines the standard for writing method specifications in the Swift Response codebase.

## 1. Specification Tags

We use the following JSDoc-style tags to formally specify behavior:

- **@requires**: Preconditions. What must be true about the state or inputs _before_ the method is called.
  - _Checked_: Enforced by runtime assertions.
  - _Unchecked_: Assumed true; violation leads to undefined behavior.
- **@effects**: Postconditions. What is guaranteed to be true _after_ the method returns successfully.
  - describes return values and state of the system.
- **@modifies**: Side Effects. Explicitly lists what objects/state this method is allowed to change.
  - `this`: Modifies the instance itself.
  - `none`: Pure function.
- **@throws**: Exceptional Postconditions. Under what circumstances an exception is thrown.

## 2. Classification

- **Deterministic**: Same inputs always yield same outputs. (Preferred)
- **Strong**: Tolerates fewer inputs (stricter requires) or guarantees more specific outputs (stronger effects).
- **Weak**: Tolerates more inputs or guarantees less.

## 3. Example

```typescript
/**
 * Parses a string into an AST.
 *
 * @requires input is not null.
 * @modifies none (Pure function relative to external state, though maintains internal parser state during execution).
 * @effects Returns a valid ASTNode representing the expression.
 * @throws {Error} if the input syntax is invalid.
 */
parse(input: string): ASTNode
```
