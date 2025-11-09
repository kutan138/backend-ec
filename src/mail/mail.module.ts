/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { TypedConfigService } from 'src/config/TypedConfigService';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [TypedConfigService],
      useFactory: (config: TypedConfigService) => {
        const mailConfig = config.getMailConfig();

        return {
          transport: {
            host: mailConfig.host,
            port: mailConfig.port,
            secure: mailConfig.secure,
            auth: {
              user: mailConfig.user,
              pass: mailConfig.pass,
            },
          },
          defaults: {
            from: `"No Reply" <${mailConfig.from}>`,
          },
          template: {
            dir: process.cwd() + '/src/mail/templates/',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
