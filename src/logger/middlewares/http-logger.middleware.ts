import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AppLogger } from '../logger.service';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const requestId = req.requestId; // gắn từ RequestIdMiddleware
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;

      this.logger.log(
        `[${requestId}] ${method} ${originalUrl} ${statusCode} - ${duration}ms`,
        {
          context: 'HTTP',
          requestId,
          method,
          url: originalUrl,
          statusCode,
          duration,
        },
      );
    });

    next();
  }
}
