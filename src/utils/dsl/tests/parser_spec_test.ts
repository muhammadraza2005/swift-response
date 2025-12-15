/**
 * Specification-Based Testing for Parser
 * Verify that implementation conforms to the contract defined in specs.
 */

import { Parser } from '../parser';
import { assert } from '../../debug/assert';

async function runSpecTests() {
  console.log('Running Specification Tests for Parser...');
  const parser = new Parser();

  // Test 1: Verify Precondition (@requires input is not null)
  // Spec: @throws {AssertionError} if input is null/undefined
  try {
    // @ts-ignore - forcefully passing null to test runtime check
    parser.parse(null);
    console.error('❌ FAIL: Did not throw on null input');
  } catch (e: any) {
    if (e.name === 'AssertionError') {
      console.log('✅ PASS: Throws AssertionError on null input');
    } else {
      console.error(`❌ FAIL: Threw wrong error type: ${e.name}`);
    }
  }

  // Test 2: Verify Strong Postcondition (Full consumption)
  // Spec: @throws {Error} if unexpected token at end
  try {
    parser.parse('1 + 1 extra');
    console.error('❌ FAIL: Did not throw on partial match');
  } catch (e: any) {
    if (e.message.includes('Unexpected token')) {
      console.log('✅ PASS: Throws Error on unconsumed tokens');
    } else {
      console.error(`❌ FAIL: Unexpected error message: ${e.message}`);
    }
  }

  // Test 3: Verify Determinism
  // Spec: Same input -> Same AST structure
  const input = 'a + b';
  const ast1 = parser.parse(input);
  const ast2 = parser.parse(input);
  
  if (JSON.stringify(ast1) === JSON.stringify(ast2)) {
    console.log('✅ PASS: Deterministic output verified');
  } else {
    console.error('❌ FAIL: Nondeterministic output detected');
  }
}

// Execute if run directly
runSpecTests().catch(console.error);
