import { Request, Response, NextFunction } from 'express';
import { db } from '../db';

export function requireDatabase(req: Request, res: Response, next: NextFunction) {
  if (!db) {
    return res.status(503).json({
      message: "Database not configured. Please set DATABASE_URL in environment variables.",
      error: "SERVICE_UNAVAILABLE"
    });
  }
  next();
}
