import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateConfig } from './validation';
import { TypedConfigService } from './TypedConfigService';
import databaseConfig from './environment/database.config';
import googleConfig from './environment/google.config';
import jwtConfig from './environment/jwt.config';
import mailConfig from './environment/mail.config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, googleConfig, jwtConfig, mailConfig],
      validate: validateConfig,
      cache: true,
      expandVariables: true,
    }),
  ],
  providers: [TypedConfigService],
  exports: [TypedConfigService],
})
export class AppConfigModule {}
