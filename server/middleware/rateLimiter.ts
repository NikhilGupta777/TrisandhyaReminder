 import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests = new Map<string, RequestRecord>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private options: RateLimitOptions) {
    // Clean up expired records every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.getKey(req);
      const now = Date.now();
      const windowStart = now - this.options.windowMs;

      let record = this.requests.get(key);

      if (!record || record.resetTime < windowStart) {
        // First request in window or window expired
        record = {
          count: 1,
          resetTime: now + this.options.windowMs,
        };
        this.requests.set(key, record);
        res.set('X-RateLimit-Remaining', (this.options.maxRequests - 1).toString());
        res.set('X-RateLimit-Reset', record.resetTime.toString());
        return next();
      }

      // Check if limit exceeded
      if (record.count >= this.options.maxRequests) {
        const resetTime = Math.ceil((record.resetTime - now) / 1000);
        res.set('X-RateLimit-Remaining', '0');
        res.set('X-RateLimit-Reset', record.resetTime.toString());

        return res.status(429).json({
          message: this.options.message || 'Too many requests, please try again later.',
          retryAfter: resetTime,
        });
      }

      // Increment counter
      record.count++;
      res.set('X-RateLimit-Remaining', (this.options.maxRequests - record.count).toString());
      res.set('X-RateLimit-Reset', record.resetTime.toString());

      // Skip counting if configured
      if (this.options.skipSuccessfulRequests && res.statusCode < 400) {
        record.count--;
      } else if (this.options.skipFailedRequests && res.statusCode >= 400) {
        record.count--;
      }

      next();
    };
  }

  private getKey(req: Request): string {
    // Use IP address as key, fallback to a default if not available
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || '';
    return `${ip}:${userAgent}`;
  }

  private cleanup() {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.requests.forEach((record, key) => {
      if (record.resetTime < now) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.requests.delete(key));
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
  }
}

// Create rate limiters for different endpoints
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes for auth
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes for general API
  message: 'Too many requests. Please try again later.',
});

export const fileUploadRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 uploads per hour
  message: 'Too many file uploads. Please try again in an hour.',
});

// Graceful shutdown
process.on('SIGINT', () => {
  authRateLimiter.destroy();
  apiRateLimiter.destroy();
  fileUploadRateLimiter.destroy();
});

process.on('SIGTERM', () => {
  authRateLimiter.destroy();
  apiRateLimiter.destroy();
  fileUploadRateLimiter.destroy();
});