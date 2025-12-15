# Recursion Implementation and Analysis

This document details the systematic application of recursion within the Swift Response codebase, particularly in the Emergency Filter DSL.

## 1. Overview of Recursive Patterns

We utilize recursion primarily for processing the hierarchical Abstract Syntax Tree (AST) of the filtering language. Two distinct recursive patterns are employed:

1.  **Recursive Descent Parsing**: To build the tree structure from linear text.
2.  **Structural Recursion (Visitor Pattern)**: To process the tree for evaluation and optimization.

## 2. Implemented Modules

### 2.1 Recursive Descent Parser (`src/utils/dsl/parser.ts`)

The `Parser` class constructs the AST using a set of mutually recursive methods.

- **Recursive Definition**: An `Expression` is defined as a `Ternary`, which may contain other `Expression`s.
- **Structure**:
  ```typescript
  parseExpression() -> parseTernary()
  parseTernary() -> parseLogicalOr() [-> parseLogicalAnd() ...]
  parsePrimary() -> '(' parseExpression() ')' // Cycles back to top
  ```
- **Base Cases**: `parsePrimary()` handles leaf nodes (Numbers, Strings, Identifiers) that do not trigger further recursion.

### 2.2 Constant Folding Optimizer (`src/utils/dsl/optimizer.ts`)

The `ConstantFoldingOptimizer` demonstrates a new recursive module designed to simplify the AST.

- **Problem**: `optimize(Node)`
- **Decomposition**:
  1.  Recursively optimize children: `left' = optimize(left)`, `right' = optimize(right)`
  2.  Combine results: `fold(op, left', right')`
- **Base Cases**:
  - `visitLiteral(node)`: Returns `node` (cannot be simpler).
  - `visitVariable(node)`: Returns `node` (unknown value).
- **Recursive Step**:
  - `visitBinaryOp(node)`: Calls `accept` on children, then checks if they are now Literals.

### 2.3 Evaluator (`src/utils/dsl/evaluator.ts`)

The `Evaluator` computes the result of the AST recursively.

- **Base Case**: `visitLiteral` returns the raw value.
- **Recursive Step**: `visitBinaryOp` evaluates left and right children before applying the operator.

## 3. Analysis of Correctness and Termination

### Structural Recursion

All recursive operations (Evaluation, Optimization) operate on the AST, which is a **Finite Directed Acyclic Graph (DAG)** (specifically, a Tree).

- **Progress**: Each recursive call operates on a child node, which strictly has a smaller height than the parent.
- **Termination**: Since the tree height is finite and decreases with every call, the recursion is guaranteed to terminate at leaf nodes (Literals/Variables).

### Parser Recursion

The recursive descent parser consumes tokens from a finite list.

- **Progress**: Every "consumption" method (`consume`, explicit checks) advances the token pointer.
- **Termination**: The token stream is finite (`EOF`). Provided there are no infinite loops in grammar rules (e.g., `A -> A`), the parser terminates.

## 4. Value of Recursion

Recursion provides a clear conceptual advantage here:

- **Natural Fit**: The data structure (Tree) is recursive. Iterative approaches would require manual stack management, reducing clarity.
- **Immutability**: The recursive optimizer builds a _new_ tree bottom-up, naturally supporting immutable data structures without complex state management.
