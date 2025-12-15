/**
 * Evaluator Test Suite
 * Systematic testing of the Evaluator module using the SimpleTestRunner.
 */

import { Evaluator } from '../evaluator';
import { 
  LiteralNode, 
  BinaryOpNode, 
  UnaryOpNode,
  VariableNode
} from '../ast';
import { TestSuite, expect, expectFn } from '../../testing/SimpleTestRunner';

const suite = new TestSuite();

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
suite.test('Arithmetic: Addition', () => {
  const node = new BinaryOpNode('+', new LiteralNode(5), new LiteralNode(3));
  expect(node.accept(evaluator)).toBe(8);
});

suite.test('Arithmetic: Subtraction', () => {
  const node = new BinaryOpNode('-', new LiteralNode(10), new LiteralNode(4));
  expect(node.accept(evaluator)).toBe(6);
});

suite.test('Arithmetic: Division by Zero', () => {
  const node = new BinaryOpNode('/', new LiteralNode(10), new LiteralNode(0));
  expectFn(() => node.accept(evaluator)).toThrow('Division by zero');
});

// 2. String Concatenation (Polymorphism of +)
suite.test('String Concatenation', () => {
  const node = new BinaryOpNode('+', new LiteralNode('Hello '), new LiteralNode('World'));
  expect(node.accept(evaluator)).toBe('Hello World');
});

// 3. Logic Tests
suite.test('Logic: AND', () => {
  const node = new BinaryOpNode('&&', new LiteralNode(true), new LiteralNode(false));
  expect(node.accept(evaluator)).toBe(false);
});

// 4. Comparison Tests
suite.test('Comparison: Less Than', () => {
  const node = new BinaryOpNode('<', new LiteralNode(5), new LiteralNode(10));
  expect(node.accept(evaluator)).toBe(true);
});

// 5. Variable Resolution
suite.test('Variable Access', () => {
  const node = new VariableNode('a');
  expect(node.accept(evaluator)).toBe(10);
});

suite.test('Undefined Variable', () => {
  const node = new VariableNode('missing');
  expectFn(() => node.accept(evaluator)).toThrow('Undefined variable');
});

// Run the suite
suite.run().catch(console.error);
