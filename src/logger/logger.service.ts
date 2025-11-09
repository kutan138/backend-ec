import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AppLogger implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  log(message: string, ...optionalParams: any[]) {
    this.logger.info(message, { optionalParams });
  }

  error(message: string, ...optionalParams: any[]) {
    this.logger.error(message, { optionalParams });
  }

  warn(message: string, ...optionalParams: any[]) {
    this.logger.warn(message, { optionalParams });
  }

  debug(message: string, ...optionalParams: any[]) {
    this.logger.debug(message, { optionalParams });
  }

  verbose(message: string, ...optionalParams: any[]) {
    this.logger.verbose(message, { optionalParams });
  }

  fatal(message: string, ...optionalParams: any[]) {
    this.logger.log('fatal', message, { optionalParams });
  }
}
