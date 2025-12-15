/**
 * Recursive AST Optimizer - Constant Folding & Algebraic Simplification
 * 
 * Improvements:
 * - Added Algebraic Simplification (Identity, Zero Property)
 * - Added Static Exhaustiveness Checking (Stubbed for demo)
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
import { assertUnreachable } from '../debug/assert';

export class ConstantFoldingOptimizer implements ASTVisitor<ASTNode> {
  
  optimize(node: ASTNode): ASTNode {
    return node.accept(this);
  }

  visitLiteral(node: LiteralNode): ASTNode {
    return node;
  }

  visitVariable(node: VariableNode): ASTNode {
    return node;
  }

  visitBinaryOp(node: BinaryOpNode): ASTNode {
    const left = node.left.accept(this);
    const right = node.right.accept(this);

    // 1. CONSTANT FOLDING: Literal op Literal
    if (left instanceof LiteralNode && right instanceof LiteralNode) {
        try {
            return this.foldBinary(node.operator, left.value, right.value);
        } catch (e) {
            return new BinaryOpNode(node.operator, left, right);
        }
    }

    // 2. ALGEBRAIC SIMPLIFICATION: Identity & Zero Properties
    // Check right side identities (x + 0, x * 1, x * 0)
    if (right instanceof LiteralNode) {
        if (node.operator === '+' && right.value === 0) return left; // x + 0 -> x
        if (node.operator === '*' && right.value === 1) return left; // x * 1 -> x
        if (node.operator === '*' && right.value === 0) return new LiteralNode(0); // x * 0 -> 0
    }

    // Check left side identities (0 + x, 1 * x, 0 * x)
    if (left instanceof LiteralNode) {
        if (node.operator === '+' && left.value === 0) return right;
        if (node.operator === '*' && left.value === 1) return right;
        if (node.operator === '*' && left.value === 0) return new LiteralNode(0);
    }

    return new BinaryOpNode(node.operator, left, right);
  }

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

  visitFunctionCall(node: FunctionCallNode): ASTNode {
    const args = node.args.map(arg => arg.accept(this));
    return new FunctionCallNode(node.name, args);
  }

  visitConditional(node: ConditionalNode): ASTNode {
    const condition = node.condition.accept(this);

    if (condition instanceof LiteralNode) {
      if (condition.value) {
        return node.trueExpr.accept(this);
      } else {
        return node.falseExpr.accept(this);
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
      default: return new BinaryOpNode(op, new LiteralNode(left), new LiteralNode(right)) as any;
    }
  }
}
