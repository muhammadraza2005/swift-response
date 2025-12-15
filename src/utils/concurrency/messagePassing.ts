/**
 * Message Passing Module - Actor-based concurrency
 * Implements message-passing patterns for safe concurrent communication
 */

export type MessageHandler<T = unknown> = (message: T) => Promise<void> | void;

export interface Message<T = unknown> {
  id: string;
  type: string;
  payload: T;
  timestamp: number;
  sender?: string;
  priority?: number;
}

/**
 * MessageQueue - FIFO queue with priority support
 */
export class MessageQueue<T = unknown> {
  private queue: Message<T>[] = [];
  private processing = false;
  private handlers = new Map<string, MessageHandler<T>>();

  /**
   * Send a message to the queue
   */
  async send(type: string, payload: T, priority: number = 0, sender?: string): Promise<string> {
    const message: Message<T> = {
      id: this.generateId(),
      type,
      payload,
      timestamp: Date.now(),
      sender,
      priority,
    };

    // Insert based on priority (higher priority first)
    const insertIndex = this.queue.findIndex(m => (m.priority ?? 0) < priority);
    if (insertIndex === -1) {
      this.queue.push(message);
    } else {
      this.queue.splice(insertIndex, 0, message);
    }

    this.processQueue();
    return message.id;
  }

  /**
   * Register a handler for a message type
   */
  on(type: string, handler: MessageHandler<T>): void {
    this.handlers.set(type, handler);
  }

  /**
   * Unregister a handler
   */
  off(type: string): void {
    this.handlers.delete(type);
  }

  /**
   * Process messages in the queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const message = this.queue.shift()!;
      const handler = this.handlers.get(message.type);

      if (handler) {
        try {
          await handler(message.payload);
        } catch (error) {
          console.error(`Error processing message ${message.id}:`, error);
        }
      }
    }

    this.processing = false;
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Clear all messages
   */
  clear(): void {
    this.queue = [];
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Channel - Bidirectional message passing
 */
export class Channel<T = unknown> {
  private queue: T[] = [];
  private receivers: Array<(value: T) => void> = [];
  private closed = false;

  /**
   * Send a value through the channel
   */
  async send(value: T): Promise<void> {
    if (this.closed) {
      throw new Error('Cannot send on closed channel');
    }

    if (this.receivers.length > 0) {
      const receiver = this.receivers.shift()!;
      receiver(value);
    } else {
      this.queue.push(value);
    }
  }

  /**
   * Receive a value from the channel
   */
  async receive(): Promise<T> {
    if (this.closed && this.queue.length === 0) {
      throw new Error('Cannot receive from closed channel');
    }

    if (this.queue.length > 0) {
      return this.queue.shift()!;
    }

    return new Promise<T>((resolve) => {
      this.receivers.push(resolve);
    });
  }

  /**
   * Try to receive without blocking
   */
  tryReceive(): T | undefined {
    return this.queue.shift();
  }

  /**
   * Close the channel
   */
  close(): void {
    this.closed = true;
  }

  /**
   * Check if channel is closed
   */
  isClosed(): boolean {
    return this.closed;
  }

  /**
   * Get number of queued messages
   */
  length(): number {
    return this.queue.length;
  }
}

/**
 * Actor - Autonomous entity that processes messages
 */
export abstract class Actor<TMessage = unknown, TState = unknown> {
  private mailbox = new MessageQueue<TMessage>();
  protected state: TState;
  private readonly actorId: string;

  constructor(initialState: TState, actorId?: string) {
    this.state = initialState;
    this.actorId = actorId || this.generateId();
    this.setupHandlers();
  }

  /**
   * Send a message to this actor
   */
  async tell(type: string, payload: TMessage, priority?: number): Promise<void> {
    await this.mailbox.send(type, payload, priority, 'external');
  }

  /**
   * Setup message handlers (override in subclass)
   */
  protected abstract setupHandlers(): void;

  /**
   * Register a handler for a message type
   */
  protected registerHandler(type: string, handler: MessageHandler<TMessage>): void {
    this.mailbox.on(type, handler);
  }

  /**
   * Get actor ID
   */
  getId(): string {
    return this.actorId;
  }

  /**
   * Get current state (readonly)
   */
  getState(): Readonly<TState> {
    return this.state;
  }

  private generateId(): string {
    return `actor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * EventBus - Pub/Sub message passing
 */
export class EventBus<T = unknown> {
  private subscribers = new Map<string, Set<MessageHandler<T>>>();

  /**
   * Subscribe to an event
   */
  subscribe(event: string, handler: MessageHandler<T>): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    
    this.subscribers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.subscribers.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.subscribers.delete(event);
        }
      }
    };
  }

  /**
   * Publish an event
   */
  async publish(event: string, payload: T): Promise<void> {
    const handlers = this.subscribers.get(event);
    if (!handlers) return;

    const promises = Array.from(handlers).map(handler => {
      try {
        return Promise.resolve(handler(payload));
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
        return Promise.resolve();
      }
    });

    await Promise.all(promises);
  }

  /**
   * Get subscriber count for an event
   */
  subscriberCount(event: string): number {
    return this.subscribers.get(event)?.size ?? 0;
  }

  /**
   * Clear all subscribers
   */
  clear(): void {
    this.subscribers.clear();
  }
}
