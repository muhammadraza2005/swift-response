/**
 * Extended Optimizer Test Suite - Test-First Development
 * 
 * Objectives:
 * 1. Define expectations for algebraic simplifications (Identity, Zero property).
 * 2. This test SHOULD FAIL initially, driving the implementation of these features.
 * 
 * Partitions:
 * - Identity: x + 0, x * 1
 * - Zero Property: x * 0
 * - Idempotency: !!x -> x (Not implemented yet)
 */

import { ConstantFoldingOptimizer } from '../optimizer';
import { 
  LiteralNode, 
  BinaryOpNode, 
  VariableNode
} from '../ast';
import { TestSuite, expect } from '../../testing/SimpleTestRunner';

const suite = new TestSuite();
const optimizer = new ConstantFoldingOptimizer();

// Helper to check if node is a specific literal
const isLiteral = (node: any, val: any) => {
  if (node.type !== 'Literal') throw new Error(`Expected Literal, got ${node.type}`);
  if (node.value !== val) throw new Error(`Expected value ${val}, got ${node.value}`);
};

// Helper to check if node is a variable
const isVariable = (node: any, name: string) => {
  if (node.type !== 'Variable') throw new Error(`Expected Variable, got ${node.type}`);
  if (node.name !== name) throw new Error(`Expected variable ${name}, got ${node.name}`);
};

suite.test('Identity: Add Zero (x + 0 -> x)', () => {
    // Partition: Variable + Literal(0)
    const tree = new BinaryOpNode('+', new VariableNode('x'), new LiteralNode(0));
    const optimized = optimizer.optimize(tree);
    
    // Test Expectation: Should be just 'x'
    isVariable(optimized, 'x');
});

suite.test('Identity: Multiply One (x * 1 -> x)', () => {
    // Partition: Variable * Literal(1)
    const tree = new BinaryOpNode('*', new VariableNode('x'), new LiteralNode(1));
    const optimized = optimizer.optimize(tree);
    
    isVariable(optimized, 'x');
});

suite.test('Zero Property: Multiply Zero (x * 0 -> 0)', () => {
    // Partition: Variable * Literal(0)
    const tree = new BinaryOpNode('*', new VariableNode('x'), new LiteralNode(0));
    const optimized = optimizer.optimize(tree);
    
    isLiteral(optimized, 0);
});

suite.run().catch(console.error);
