/**
 * Emergency Update Event Bus - Demonstrates message-passing concurrency
 * Uses pub/sub pattern for decoupled communication
 */

import { EventBus, Actor, MessageQueue, Channel } from '../concurrency/messagePassing';
import { IEmergencyRequest } from '@/types/models';

/**
 * Emergency update events
 */
export interface EmergencyUpdateEvent {
  type: 'created' | 'updated' | 'deleted' | 'status_changed';
  requestId: string;
  request?: IEmergencyRequest;
  oldStatus?: string;
  newStatus?: string;
  timestamp: number;
}

/**
 * Global event bus for emergency updates
 */
export const emergencyEventBus = new EventBus<EmergencyUpdateEvent>();

/**
 * Emergency Notification Actor - Processes notifications independently
 */
export class EmergencyNotificationActor extends Actor<EmergencyUpdateEvent, { pendingNotifications: string[] }> {
  protected setupHandlers(): void {
    this.registerHandler('notify', async (event) => {
      // Process notification asynchronously
      await this.processNotification(event);
    });

    this.registerHandler('flush', async () => {
      // Flush all pending notifications
      await this.flushNotifications();
    });
  }

  private async processNotification(event: EmergencyUpdateEvent): Promise<void> {
    console.log(`[Notification Actor] Processing: ${event.type} for request ${event.requestId}`);
    
    // Add to pending queue
    this.state.pendingNotifications.push(event.requestId);
    
    // Simulate notification sending (e.g., push notification, email, SMS)
    await this.sendNotification(event);
  }

  private async sendNotification(event: EmergencyUpdateEvent): Promise<void> {
    // In real implementation, this would call notification service
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`[Notification Actor] Sent ${event.type} notification for ${event.requestId}`);
    
    // Remove from pending
    this.state.pendingNotifications = this.state.pendingNotifications.filter(
      id => id !== event.requestId
    );
  }

  private async flushNotifications(): Promise<void> {
    console.log(`[Notification Actor] Flushing ${this.state.pendingNotifications.length} pending notifications`);
    this.state.pendingNotifications = [];
  }
}

/**
 * Emergency Logger Actor - Logs all events independently
 */
export class EmergencyLoggerActor extends Actor<EmergencyUpdateEvent, { logCount: number }> {
  protected setupHandlers(): void {
    this.registerHandler('log', async (event) => {
      await this.logEvent(event);
    });

    this.registerHandler('stats', async () => {
      console.log(`[Logger Actor] Total logs: ${this.state.logCount}`);
    });
  }

  private async logEvent(event: EmergencyUpdateEvent): Promise<void> {
    this.state.logCount++;
    
    const logEntry = {
      timestamp: event.timestamp,
      type: event.type,
      requestId: event.requestId,
      details: event.request ? {
        type: event.request.type,
        status: event.request.status,
        location: event.request.location,
      } : null,
    };
    
    console.log('[Logger Actor] Event:', logEntry);
    
    // In real implementation, this would write to persistent log storage
  }
}

/**
 * Emergency Update Coordinator - Coordinates message passing
 */
export class EmergencyUpdateCoordinator {
  private messageQueue = new MessageQueue<EmergencyUpdateEvent>();
  private notificationActor: EmergencyNotificationActor;
  private loggerActor: EmergencyLoggerActor;
  private updateChannel = new Channel<EmergencyUpdateEvent>();

  constructor() {
    this.notificationActor = new EmergencyNotificationActor(
      { pendingNotifications: [] },
      'notification-actor'
    );
    
    this.loggerActor = new EmergencyLoggerActor(
      { logCount: 0 },
      'logger-actor'
    );

    this.setupMessageHandlers();
  }

  private setupMessageHandlers(): void {
    // Handle emergency updates through message queue
    this.messageQueue.on('emergency_update', async (event) => {
      // Fan-out to multiple actors (message passing pattern)
      await Promise.all([
        this.notificationActor.tell('notify', event, event.type === 'created' ? 10 : 5),
        this.loggerActor.tell('log', event),
      ]);
      
      // Also publish to event bus for other subscribers
      await emergencyEventBus.publish('emergency_update', event);
    });
  }

  /**
   * Process an emergency update through message passing
   */
  async processUpdate(event: EmergencyUpdateEvent): Promise<void> {
    // Send through message queue (async, non-blocking)
    await this.messageQueue.send('emergency_update', event, event.type === 'created' ? 10 : 5);
  }

  /**
   * Send update through channel (bidirectional communication)
   */
  async sendThroughChannel(event: EmergencyUpdateEvent): Promise<void> {
    await this.updateChannel.send(event);
  }

  /**
   * Receive update from channel
   */
  async receiveFromChannel(): Promise<EmergencyUpdateEvent> {
    return await this.updateChannel.receive();
  }

  /**
   * Subscribe to emergency updates
   */
  subscribe(handler: (event: EmergencyUpdateEvent) => void | Promise<void>): () => void {
    return emergencyEventBus.subscribe('emergency_update', handler);
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.messageQueue.size();
  }
}

/**
 * Global coordinator instance
 */
export const emergencyUpdateCoordinator = new EmergencyUpdateCoordinator();
