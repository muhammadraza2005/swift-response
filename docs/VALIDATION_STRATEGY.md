# Validation Strategy: Static Checking and Systematic Testing

This document outlines the validation techniques applied to the Swift Response codebase to ensure correctness.

## 1. Static Checking

We leverage TypeScript's type system to detect errors at compile-time (Static Analysis).

### 1.1 Discriminated Unions
We use **Discriminated Unions** for data structures like AST Nodes.
-   Each node has a unique `type` literal.
-   Allows TypeScript to narrow types strictly in control flow.

### 1.2 Exhaustiveness Checking
We ensuring that all possible cases of a discriminated union are handled.
-   **Mechanism**: The `assertUnreachable(x: never)` function.
-   **Benefit**: If a new `ASTNodeType` is added, the compiler *refuses to compile* until all visitors/switches are updated to handle it.

## 2. Systematic Testing

We use **Input Space Partitioning** to select test cases.

### 2.1 Partitioning Strategy (Example: AST Optimizer)
We divide the input domain (valid ASTs) into subdomains:
1.  **Base Cases**: Leaf nodes (Literals, Variables).
2.  **Foldable Operations**: Inputs known at compile time (e.g., `1 + 2`).
3.  **Partial Operations**: Inputs with some constants (e.g., `x + 0`).
4.  **Irreducible Operations**: Inputs with purely variable dependencies (e.g., `x + y`).
5.  **Identities**: Operations that simplify structurally (e.g., `x * 0`).

### 2.2 Test-First Approach
1.  **Write Test**: Define the expected behavior for a partition (e.g., `x * 0` should become `0`).
2.  **Fail**: Confirm the current implementation returns `x * 0`.
3.  **Implement**: Update optimizer to handle the case.
4.  **Pass**: Verify the test passes.

## 3. Testing Types

-   **Black-Box**: Testing the public `optimize()` method against specifications.
-   **White-Box**: Ensuring internal recursion paths (e.g., `visitBinaryOp`) are covered.
