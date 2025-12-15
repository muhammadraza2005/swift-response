/**
 * Recursive AST Optimizer - Constant Folding
 * 
 * Demonstrates the systematic application of recursion:
 * 1. Recursive Decomposition: Breaking complex expressions into sub-expressions
 * 2. Base Cases: Handling leaf nodes (Literals, Variables)
 * 3. Termination: Guaranteed by tree depth (DAG property)
 */

import {
  ASTNode,
  ASTVisitor,
  BinaryOpNode,
  LiteralNode,
  VariableNode,
  UnaryOpNode,
  FunctionCallNode,
  ConditionalNode,
  MemberAccessNode,
} from './ast';

export class ConstantFoldingOptimizer implements ASTVisitor<ASTNode> {
  
  /**
   * Main entry point for optimization
   */
  optimize(node: ASTNode): ASTNode {
    return node.accept(this);
  }

  /**
   * BASE CASE: Literals are already optimized
   */
  visitLiteral(node: LiteralNode): ASTNode {
    return node;
  }

  /**
   * BASE CASE: Variables cannot be folded at compile time
   */
  visitVariable(node: VariableNode): ASTNode {
    return node;
  }

  /**
   * RECURSIVE STEP: Binary Operations
   * 1. Optimize left child (Recursive call)
   * 2. Optimize right child (Recursive call)
   * 3. If both are literals, combine them (Reduction)
   */
  visitBinaryOp(node: BinaryOpNode): ASTNode {
    // Recursive decomposition
    const left = node.left.accept(this);
    const right = node.right.accept(this);

    // Try to fold
    if (left instanceof LiteralNode && right instanceof LiteralNode) {
        try {
            return this.foldBinary(node.operator, left.value, right.value);
        } catch (e) {
            // If folding fails (e.g. division by zero), return original structure
            return new BinaryOpNode(node.operator, left, right);
        }
    }

    // Reconstruction with optimized children
    return new BinaryOpNode(node.operator, left, right);
  }

  /**
   * RECURSIVE STEP: Unary Operations
   */
  visitUnaryOp(node: UnaryOpNode): ASTNode {
    const operand = node.operand.accept(this);

    if (operand instanceof LiteralNode) {
      if (node.operator === '-') {
        if (typeof operand.value === 'number') {
            return new LiteralNode(-operand.value);
        }
      } else if (node.operator === '!') {
          return new LiteralNode(!operand.value);
      }
    }

    return new UnaryOpNode(node.operator, operand);
  }

  /**
   * RECURSIVE STEP: Function Calls
   * Optimize arguments recursively
   */
  visitFunctionCall(node: FunctionCallNode): ASTNode {
    const args = node.args.map(arg => arg.accept(this));
    return new FunctionCallNode(node.name, args);
  }

  /**
   * RECURSIVE STEP: Conditionals (Ternary)
   * Can perform "Dead Code Elimination" if condition is constant
   */
  visitConditional(node: ConditionalNode): ASTNode {
    const condition = node.condition.accept(this);

    // Constant propagation / Dead code elimination
    if (condition instanceof LiteralNode) {
      if (condition.value) {
        return node.trueExpr.accept(this); // recursive optimization of taken branch
      } else {
        return node.falseExpr.accept(this); // recursive optimization of taken branch
      }
    }

    const trueExpr = node.trueExpr.accept(this);
    const falseExpr = node.falseExpr.accept(this);
    
    return new ConditionalNode(condition, trueExpr, falseExpr);
  }

  visitMemberAccess(node: MemberAccessNode): ASTNode {
    const object = node.object.accept(this);
    return new MemberAccessNode(object, node.property, node.computed);
  }

  /**
   * Helper: Performs the actual math/logic for folding
   */
  private foldBinary(op: string, left: any, right: any): LiteralNode {
    switch (op) {
      case '+': return new LiteralNode(left + right);
      case '-': return new LiteralNode(left - right);
      case '*': return new LiteralNode(left * right);
      case '/': 
        if (right === 0) throw new Error('Division by zero');
        return new LiteralNode(left / right);
      case '%': return new LiteralNode(left % right);
      case '==': return new LiteralNode(left === right);
      case '!=': return new LiteralNode(left !== right);
      case '<': return new LiteralNode(left < right);
      case '>': return new LiteralNode(left > right);
      case '<=': return new LiteralNode(left <= right);
      case '>=': return new LiteralNode(left >= right);
      case '&&': return new LiteralNode(Boolean(left) && Boolean(right));
      case '||': return new LiteralNode(Boolean(left) || Boolean(right));
      default: throw new Error(`Unknown operator ${op}`);
    }
  }
}
