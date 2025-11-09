import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { AppConfigModule } from './config/config.module';
import { LoggerModule } from './logger/logger.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    AuthModule,
    DatabaseModule,
    LoggerModule,
    RolesModule,
    PermissionsModule,
    MailModule,
  ],
})
export class AppModule {}
