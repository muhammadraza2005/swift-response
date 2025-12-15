/**
 * Evaluator - Visitor Pattern Implementation for AST Execution
 * 
 * Code Quality Improvements:
 * - Modularity: Binary operations split into functional categories.
 * - Clarity: Helper methods with descriptive names.
 * - Correctness: Strict type checking helper.
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
import { assert } from '../debug/assert';

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

    // Dispatch based on operator category
    if (['+', '-', '*', '/', '%'].includes(node.operator)) {
      return this.evaluateArithmetic(node.operator, left, right);
    }
    if (['<', '>', '<=', '>='].includes(node.operator)) {
      return this.evaluateComparison(node.operator, left, right);
    }
    if (['==', '!='].includes(node.operator)) {
      return this.evaluateEquality(node.operator, left, right);
    }
    if (['&&', '||'].includes(node.operator)) {
      return this.evaluateLogic(node.operator, left, right);
    }

    throw new Error(`Unknown operator: ${node.operator}`);
  }

  private evaluateArithmetic(op: string, left: EvaluatorValue, right: EvaluatorValue): EvaluatorValue {
    // Special case for string concatenation
    if (op === '+') {
      if (typeof left === 'string' || typeof right === 'string') {
        return String(left) + String(right);
      }
    }

    const nLeft = this.ensureNumber(left, op);
    const nRight = this.ensureNumber(right, op);

    switch (op) {
      case '+': return nLeft + nRight;
      case '-': return nLeft - nRight;
      case '*': return nLeft * nRight;
      case '/': 
        if (nRight === 0) throw new Error('Division by zero');
        return nLeft / nRight;
      case '%': return nLeft % nRight;
      default: throw new Error(`Invalid arithmetic operator: ${op}`);
    }
  }

  private evaluateComparison(op: string, left: EvaluatorValue, right: EvaluatorValue): boolean {
    const nLeft = this.ensureNumber(left, op);
    const nRight = this.ensureNumber(right, op);

    switch (op) {
      case '<': return nLeft < nRight;
      case '>': return nLeft > nRight;
      case '<=': return nLeft <= nRight;
      case '>=': return nLeft >= nRight;
      default: throw new Error(`Invalid comparison operator: ${op}`);
    }
  }

  private evaluateEquality(op: string, left: EvaluatorValue, right: EvaluatorValue): boolean {
    switch (op) {
      case '==': return left === right;
      case '!=': return left !== right;
      default: throw new Error(`Invalid equality operator: ${op}`);
    }
  }

  private evaluateLogic(op: string, left: EvaluatorValue, right: EvaluatorValue): boolean {
    switch (op) {
      case '&&': return Boolean(left) && Boolean(right);
      case '||': return Boolean(left) || Boolean(right);
      default: throw new Error(`Invalid logic operator: ${op}`);
    }
  }

  visitUnaryOp(node: UnaryOpNode): EvaluatorValue {
    const operand = node.operand.accept(this);

    switch (node.operator) {
      case '-':
        return -this.ensureNumber(operand, '-');
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

  private ensureNumber(val: EvaluatorValue, op: string): number {
    if (typeof val !== 'number') {
      throw new Error(`Invalid operand for ${op} operator: expected number, got ${typeof val}`);
    }
    if (isNaN(val)) {
        throw new Error(`Invalid operand for ${op} operator: NaN`);
    }
    return val;
  }
}
