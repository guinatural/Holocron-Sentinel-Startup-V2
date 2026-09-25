import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import Logger from './logger.js';

const logger = new Logger('EventBridge');

class EventBridgePublisher {
  constructor() {
    this.client = new EventBridgeClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  /**
   * Publish a governance event to EventBridge
   */
  async publishEvent(eventType, detail, source = 'wayfinder.governance') {
    try {
      const params = {
        Entries: [
          {
            Source: source,
            DetailType: eventType,
            Detail: JSON.stringify({
              timestamp: new Date().toISOString(),
              ...detail
            })
          }
        ]
      };

      const command = new PutEventsCommand(params);
      const response = await this.client.send(command);

      if (response.FailedEntryCount > 0) {
        logger.warn(`Failed to publish ${response.FailedEntryCount} event(s)`, {
          failedCount: response.FailedEntryCount,
          eventType
        });
        return false;
      }

      logger.debug(`Event published: ${eventType}`, detail);
      return true;
    } catch (error) {
      logger.error(`Failed to publish event: ${eventType}`, {
        error: error.message,
        eventType
      });
      throw error;
    }
  }

  /**
   * Publish multiple events in batch
   */
  async publishBatch(events) {
    try {
      const entries = events.map(event => ({
        Source: event.source || 'wayfinder.governance',
        DetailType: event.detailType,
        Detail: JSON.stringify({
          timestamp: new Date().toISOString(),
          ...event.detail
        })
      }));

      const params = { Entries: entries };
      const command = new PutEventsCommand(params);
      const response = await this.client.send(command);

      logger.info(`Batch events published`, {
        totalCount: events.length,
        failedCount: response.FailedEntryCount
      });

      return response.FailedEntryCount === 0;
    } catch (error) {
      logger.error('Failed to publish batch events', {
        error: error.message,
        count: events.length
      });
      throw error;
    }
  }
}

export default EventBridgePublisher;
