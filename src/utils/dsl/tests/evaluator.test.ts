/**
 * Evaluator Test Suite
 * Systematic testing of the Evaluator module using Jest.
 */

import { Evaluator } from '../evaluator';
import {
  LiteralNode,
  BinaryOpNode,
  UnaryOpNode,
  VariableNode
} from '../ast';

describe('Evaluator', () => {
  const context = {
    a: 10,
    b: 20,
    zero: 0,
    name: 'Swift',
    isTrue: true
  };

  const functions = {
    max: (...args: any[]) => Math.max(...args)
  };

  const evaluator = new Evaluator(context, functions);

  // 1. Arithmetic Tests
  test('Arithmetic: Addition', () => {
    const node = new BinaryOpNode('+', new LiteralNode(5), new LiteralNode(3));
    expect(node.accept(evaluator)).toBe(8);
  });

  test('Arithmetic: Subtraction', () => {
    const node = new BinaryOpNode('-', new LiteralNode(10), new LiteralNode(4));
    expect(node.accept(evaluator)).toBe(6);
  });

  test('Arithmetic: Division by Zero', () => {
    const node = new BinaryOpNode('/', new LiteralNode(10), new LiteralNode(0));
    expect(() => node.accept(evaluator)).toThrow('Division by zero');
  });

  // 2. String Concatenation (Polymorphism of +)
  test('String Concatenation', () => {
    const node = new BinaryOpNode('+', new LiteralNode('Hello '), new LiteralNode('World'));
    expect(node.accept(evaluator)).toBe('Hello World');
  });

  // 3. Logic Tests
  test('Logic: AND', () => {
    const node = new BinaryOpNode('&&', new LiteralNode(true), new LiteralNode(false));
    expect(node.accept(evaluator)).toBe(false);
  });

  // 4. Comparison Tests
  test('Comparison: Less Than', () => {
    const node = new BinaryOpNode('<', new LiteralNode(5), new LiteralNode(10));
    expect(node.accept(evaluator)).toBe(true);
  });

  // 5. Variable Resolution
  test('Variable Access', () => {
    const node = new VariableNode('a');
    expect(node.accept(evaluator)).toBe(10);
  });

  test('Undefined Variable', () => {
    const node = new VariableNode('missing');
    expect(() => node.accept(evaluator)).toThrow('Undefined variable');
  });
});

