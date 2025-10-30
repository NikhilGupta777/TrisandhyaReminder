import { Request, Response, NextFunction } from 'express';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  error?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private log(level: LogEntry['level'], message: string, extra: Partial<LogEntry> = {}) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...extra,
    };

    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      const prefix = `[${entry.timestamp}] ${level.toUpperCase()}`;
      switch (level) {
        case 'error':
          console.error(`${prefix}: ${message}`, extra.error || '');
          break;
        case 'warn':
          console.warn(`${prefix}: ${message}`);
          break;
        default:
          console.log(`${prefix}: ${message}`);
      }
    }
  }

  info(message: string, extra?: Partial<LogEntry>) {
    this.log('info', message, extra);
  }

  warn(message: string, extra?: Partial<LogEntry>) {
    this.log('warn', message, extra);
  }

  error(message: string, error?: any, extra?: Partial<LogEntry>) {
    this.log('error', message, { ...extra, error });
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      const originalSend = res.send;

      res.send = function (body) {
        const duration = Date.now() - start;

        const logEntry: Partial<LogEntry> = {
          userId: (req as any).user?.id,
          ip: req.ip || req.socket.remoteAddress,
          userAgent: req.get('User-Agent'),
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
        };

        // Log based on status code
        if (res.statusCode >= 500) {
          logger.error(`Server error: ${req.method} ${req.url}`, undefined, logEntry);
        } else if (res.statusCode >= 400) {
          logger.warn(`Client error: ${req.method} ${req.url}`, logEntry);
        } else if (req.url.startsWith('/api')) {
          logger.info(`API request: ${req.method} ${req.url}`, logEntry);
        }

        return originalSend.call(this, body);
      };

      next();
    };
  }

  getLogs(level?: LogEntry['level'], limit = 100): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    return filteredLogs.slice(-limit);
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Server shutting down gracefully');
});

process.on('SIGTERM', () => {
  logger.info('Server shutting down gracefully');
});