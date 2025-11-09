/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger } from 'src/logger/logger.service';
import { ErrorMapper } from 'src/common/errors/error-mapper';
import { TypedConfigService } from 'src/config/TypedConfigService';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: AppLogger,
    private readonly config: TypedConfigService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const mappedError = ErrorMapper.map(exception);

    const status =
      mappedError instanceof HttpException
        ? mappedError.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      mappedError instanceof HttpException
        ? (mappedError.getResponse() as any).message || mappedError.message
        : 'Internal server error';

    // 🚀 Log ra file/console
    this.logger.error(AllExceptionsFilter.name, {
      method: request.method,
      url: request.url,
      status,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    const responseBody: Record<string, any> = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (this.config.isLocal() && exception instanceof Error) {
      responseBody.stack = exception.stack;
    }

    response.status(status).json(responseBody);
  }
}
