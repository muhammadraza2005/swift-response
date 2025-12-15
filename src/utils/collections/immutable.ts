/**
 * Immutable Collection and Safe Iteration
 * 
 * Demonstrates:
 * 1. Immutability: Objects defined here cannot be changed after creation.
 * 2. Iteration Safety: Iterators are guaranteed to be consistent (snapshots).
 */

/**
 * An immutable list implementation.
 * Mutations return a NEW list, leaving the original unchanged.
 */
export class ImmutableList<T> implements Iterable<T> {
  private readonly data: ReadonlyArray<T>;

  constructor(items: T[] = []) {
    // Defensive copy on creation
    this.data = [...items];
    Object.freeze(this.data);
    Object.freeze(this);
  }

  /**
   * Returns a new ImmutableList with the element added
   */
  add(item: T): ImmutableList<T> {
    return new ImmutableList([...this.data, item]);
  }

  /**
   * Returns a new ImmutableList with the element removed
   */
  remove(item: T): ImmutableList<T> {
    return new ImmutableList(this.data.filter(i => i !== item));
  }

  /**
   * Returns the item at index
   */
  get(index: number): T | undefined {
    return this.data[index];
  }

  get length(): number {
    return this.data.length;
  }

  /**
   * Iterator implementation
   * Since the list is immutable, this iterator is inherently safe associated with THIS version of the list.
   * "Mutation" (creating a new list) elsewhere does not affect this iterator.
   */
  [Symbol.iterator](): Iterator<T> {
    let index = 0;
    const data = this.data; // Capture reference to THIS data array
    
    return {
      next(): IteratorResult<T> {
        if (index < data.length) {
          return { done: false, value: data[index++] };
        }
        return { done: true, value: undefined };
      }
    };
  }
}

/**
 * Resilient Iterator for Mutable Collections
 * Demonstrates how to handle mutation in a mutable collection during iteration.
 * Strategy: Snapshotting (Fail-safe)
 */
export class ResilientIterator<T> implements Iterator<T> {
  private items: T[];
  private cursor = 0;

  constructor(source: T[]) {
    // Snapshot strategy: Copy data at start of iteration
    // This prevents "ConcurrentModificationException" scenarios at the cost of memory
    this.items = [...source];
  }

  next(): IteratorResult<T> {
    if (this.cursor < this.items.length) {
      return { done: false, value: this.items[this.cursor++] };
    }
    return { done: true, value: undefined };
  }
}
