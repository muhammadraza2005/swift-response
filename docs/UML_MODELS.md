# Software Design Models (UML)

This document applies Unified Modeling Language (UML) to visualize and reason about the system's design.

## 1. Domain Object Model (DSL) - Class Diagram
This diagram illustrates the **Visitor Pattern** implemented in the customized DSL. It shows the separation between the Data Structure (AST Nodes) and the Operations (Visitors).

```mermaid
classDiagram
    class ASTNode {
        <<interface>>
        +type: NodeType
        +accept(visitor: ASTVisitor)
    }

    class LiteralNode {
        +value: any
        +accept(v)
    }

    class BinaryOpNode {
        +operator: string
        +left: ASTNode
        +right: ASTNode
        +accept(v)
    }

    ASTNode <|.. LiteralNode
    ASTNode <|.. BinaryOpNode

    class ASTVisitor~T~ {
        <<interface>>
        +visitLiteral(n: LiteralNode)
        +visitBinaryOp(n: BinaryOpNode)
        +visitVariable(n: VariableNode)
        ...
    }

    class Evaluator {
        +visitLiteral()
        +visitBinaryOp()
    }

    class Optimizer {
        +visitLiteral()
        +visitBinaryOp()
    }

    ASTVisitor <|.. Evaluator
    ASTVisitor <|.. Optimizer

    %% Relationship: Visitor uses Nodes
    Optimizer ..> ASTNode : traverses
    Evaluator ..> ASTNode : traverses
```

## 2. Interaction Model - Sequence Diagram
This diagram captures the **Dynamic Behavior** of the `EmergencyFilterDSL` pipeline, specifically the `evaluate` operation. It highlights the precise order of parsing, optimization, and evaluation.

```mermaid
sequenceDiagram
    participant Client
    participant FilterDSL
    participant Parser
    participant Optimizer
    participant Evaluator

    Client->>FilterDSL: evaluate("type == 'Fire'", request)
    activate FilterDSL

    FilterDSL->>Parser: parse("type == 'Fire'")
    activate Parser
    Parser-->>FilterDSL: AST (Raw)
    deactivate Parser

    FilterDSL->>Optimizer: optimize(AST)
    activate Optimizer
    Optimizer->>Optimizer: visit(AST) (Recursive)
    Optimizer-->>FilterDSL: AST (Optimized)
    deactivate Optimizer

    FilterDSL->>Evaluator: new Evaluator(context)
    FilterDSL->>Evaluator: accept(AST_Optimized)
    activate Evaluator
    Evaluator-->>FilterDSL: Result (true/false)
    deactivate Evaluator

    FilterDSL-->>Client: Result
    deactivate FilterDSL
```

## 3. Lifecycle Model - State Diagram
This diagram models the lifecycle of an `EmergencyRequest`. It helps reasoning about valid state transitions (validating our "Correctness by Construction" and Invariants).

```mermaid
stateDiagram-v2
    [*] --> Pending : create()

    state Pending {
        [*] --> Unassigned
        Unassigned --> Assigned : volunteer_accepts
    }

    Pending --> Resolved : resolve()
    Pending --> Cancelled : cancel()
    
    Resolved --> [*]
    Cancelled --> [*]

    note right of Pending
        Invariant: created_at <= now
    end note
```
