import pino from 'pino';

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

class Logger {
  constructor(namespace) {
    this.logger = pinoLogger.child({ namespace });
  }

  debug(message, data = {}) {
    this.logger.debug(data, message);
  }

  info(message, data = {}) {
    this.logger.info(data, message);
  }

  warn(message, data = {}) {
    this.logger.warn(data, message);
  }

  error(message, error = {}) {
    this.logger.error(error, message);
  }

  fatal(message, error = {}) {
    this.logger.fatal(error, message);
  }

  /**
   * Logs governance event with structured data
   */
  logGovernanceEvent(eventType, details) {
    this.info(`Governance Event: ${eventType}`, {
      eventType,
      timestamp: new Date().toISOString(),
      ...details
    });
  }
}

export default Logger;
