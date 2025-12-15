/**
 * Simple Test Runner
 * A lightweight testing utility to demonstrate testing principles without heavy dependencies.
 */

type TestFn = () => Promise<void> | void;

export class TestSuite {
  private tests: { name: string; fn: TestFn }[] = [];

  test(name: string, fn: TestFn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log(`\nRunning Test Suite: ${this.constructor.name}`);
    let passed = 0;
    let failed = 0;

    for (const { name, fn } of this.tests) {
      try {
        await fn();
        console.log(`  ✅ ${name}`);
        passed++;
      } catch (e: any) {
        console.error(`  ❌ ${name}`);
        console.error(`     Error: ${e.message}`);
        failed++;
      }
    }

    console.log(`\nResults: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
  }
}

export const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, but got ${actual}`);
    }
  },
  toThrow: (errorMsgFragment?: string) => {
    // This is a placeholder; handling synchronous throws requires wrapping the call
    throw new Error('Use expect(() => fn()).toThrow() syntax');
  }
});

export const expectFn = (fn: () => void) => ({
  toThrow: (fragment?: string) => {
    try {
      fn();
    } catch (e: any) {
      if (fragment && !e.message.includes(fragment)) {
        throw new Error(`Expected error containing "${fragment}", but got "${e.message}"`);
      }
      return;
    }
    throw new Error('Expected function to throw, but it did not.');
  }
});
