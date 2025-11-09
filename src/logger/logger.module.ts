import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { AppLogger } from './logger.service';
import { TypedConfigService } from 'src/config/TypedConfigService';
import { createLoggerConfig } from './config/createLoggerConfig';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [TypedConfigService],
      useFactory: (config: TypedConfigService) =>
        createLoggerConfig(config.getEnv()),
    }),
  ],
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
