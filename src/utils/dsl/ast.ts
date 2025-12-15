/**
 * AST Node Definitions - Little Language Implementation
 * Represents code as Abstract Syntax Tree structures
 */

export type ASTNodeType = 
  | 'Literal'
  | 'Variable'
  | 'BinaryOp'
  | 'UnaryOp'
  | 'FunctionCall'
  | 'Conditional'
  | 'MemberAccess';

export interface ASTVisitor<T> {
  visitLiteral(node: LiteralNode): T;
  visitVariable(node: VariableNode): T;
  visitBinaryOp(node: BinaryOpNode): T;
  visitUnaryOp(node: UnaryOpNode): T;
  visitFunctionCall(node: FunctionCallNode): T;
  visitConditional(node: ConditionalNode): T;
  visitMemberAccess(node: MemberAccessNode): T;
}

export interface ASTNode {
  readonly type: ASTNodeType;
  accept<T>(visitor: ASTVisitor<T>): T;
}

export class LiteralNode implements ASTNode {
  readonly type = 'Literal' as const;
  
  constructor(public readonly value: string | number | boolean) {}
  
  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitLiteral(this);
  }
}

export class VariableNode implements ASTNode {
  readonly type = 'Variable' as const;
  
  constructor(public readonly name: string) {}
  
  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitVariable(this);
  }
}

export class BinaryOpNode implements ASTNode {
  readonly type = 'BinaryOp' as const;
  
  constructor(
    public readonly operator: string,
    public readonly left: ASTNode,
    public readonly right: ASTNode
  ) {}
  
  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitBinaryOp(this);
  }
}

export class UnaryOpNode implements ASTNode {
  readonly type = 'UnaryOp' as const;
  
  constructor(
    public readonly operator: string,
    public readonly operand: ASTNode
  ) {}
  
  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitUnaryOp(this);
  }
}

export class FunctionCallNode implements ASTNode {
  readonly type = 'FunctionCall' as const;
  
  constructor(
    public readonly name: string,
    public readonly args: ASTNode[]
  ) {}
  
  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitFunctionCall(this);
  }
}

export class ConditionalNode implements ASTNode {
  readonly type = 'Conditional' as const;
  
  constructor(
    public readonly condition: ASTNode,
    public readonly trueExpr: ASTNode,
    public readonly falseExpr: ASTNode
  ) {}
  
  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitConditional(this);
  }
}

export class MemberAccessNode implements ASTNode {
  readonly type = 'MemberAccess' as const;
  
  constructor(
    public readonly object: ASTNode,
    public readonly property: string,
    public readonly computed: boolean = false
  ) {}
  
  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitMemberAccess(this);
  }
}
