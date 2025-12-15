/**
 * Evaluator - Visitor Pattern Implementation for AST Execution
 */

import {
  ASTVisitor,
  LiteralNode,
  VariableNode,
  BinaryOpNode,
  UnaryOpNode,
  FunctionCallNode,
  ConditionalNode,
  MemberAccessNode,
} from './ast';

type EvaluatorValue = string | number | boolean | Record<string, unknown> | null | undefined;
type EvaluatorContext = Record<string, EvaluatorValue>;
type EvaluatorFunction = (...args: EvaluatorValue[]) => EvaluatorValue;

export class Evaluator implements ASTVisitor<EvaluatorValue> {
  constructor(
    private readonly context: EvaluatorContext,
    private readonly functions: Record<string, EvaluatorFunction>
  ) {}

  visitLiteral(node: LiteralNode): EvaluatorValue {
    return node.value;
  }

  visitVariable(node: VariableNode): EvaluatorValue {
    if (!(node.name in this.context)) {
      throw new Error(`Undefined variable: ${node.name}`);
    }
    return this.context[node.name];
  }

  visitBinaryOp(node: BinaryOpNode): EvaluatorValue {
    const left = node.left.accept(this);
    const right = node.right.accept(this);

    switch (node.operator) {
      case '+':
        if (typeof left === 'number' && typeof right === 'number') {
          return left + right;
        }
        if (typeof left === 'string' || typeof right === 'string') {
          return String(left) + String(right);
        }
        throw new Error('Invalid operands for + operator');
      
      case '-':
        if (typeof left === 'number' && typeof right === 'number') {
          return left - right;
        }
        throw new Error('Invalid operands for - operator');
      
      case '*':
        if (typeof left === 'number' && typeof right === 'number') {
          return left * right;
        }
        throw new Error('Invalid operands for * operator');
      
      case '/':
        if (typeof left === 'number' && typeof right === 'number') {
          return left / right;
        }
        throw new Error('Invalid operands for / operator');
      
      case '%':
        if (typeof left === 'number' && typeof right === 'number') {
          return left % right;
        }
        throw new Error('Invalid operands for % operator');
      
      case '==': return left === right;
      case '!=': return left !== right;
      case '<':
        if (typeof left === 'number' && typeof right === 'number') {
          return left < right;
        }
        throw new Error('Invalid operands for < operator');
      
      case '>':
        if (typeof left === 'number' && typeof right === 'number') {
          return left > right;
        }
        throw new Error('Invalid operands for > operator');
      
      case '<=':
        if (typeof left === 'number' && typeof right === 'number') {
          return left <= right;
        }
        throw new Error('Invalid operands for <= operator');
      
      case '>=':
        if (typeof left === 'number' && typeof right === 'number') {
          return left >= right;
        }
        throw new Error('Invalid operands for >= operator');
      
      case '&&': return Boolean(left) && Boolean(right);
      case '||': return Boolean(left) || Boolean(right);
      
      default:
        throw new Error(`Unknown operator: ${node.operator}`);
    }
  }

  visitUnaryOp(node: UnaryOpNode): EvaluatorValue {
    const operand = node.operand.accept(this);

    switch (node.operator) {
      case '-':
        if (typeof operand === 'number') {
          return -operand;
        }
        throw new Error('Invalid operand for - operator');
      
      case '!':
        return !operand;
      
      default:
        throw new Error(`Unknown unary operator: ${node.operator}`);
    }
  }

  visitFunctionCall(node: FunctionCallNode): EvaluatorValue {
    if (!(node.name in this.functions)) {
      throw new Error(`Undefined function: ${node.name}`);
    }
    
    const args = node.args.map(arg => arg.accept(this));
    return this.functions[node.name](...args);
  }

  visitConditional(node: ConditionalNode): EvaluatorValue {
    const condition = node.condition.accept(this);
    return condition ? node.trueExpr.accept(this) : node.falseExpr.accept(this);
  }

  visitMemberAccess(node: MemberAccessNode): EvaluatorValue {
    const object = node.object.accept(this);
    
    if (object === null || object === undefined) {
      throw new Error('Cannot access property of null or undefined');
    }
    
    if (typeof object !== 'object') {
      throw new Error('Cannot access property of non-object');
    }
    
    const value = (object as Record<string, unknown>)[node.property];
    return value as EvaluatorValue;
  }
}
