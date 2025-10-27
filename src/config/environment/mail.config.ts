import { ConfigType, registerAs } from '@nestjs/config';
import { ConfigModules } from '../types/ConfigModules';

const mailConfig = registerAs(ConfigModules.Mail, () => ({
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS,
  smtpPort: parseInt(process.env.SMTP_PORT ?? '587', 10),
}));

export type MailConfig = ConfigType<typeof mailConfig>;
export default mailConfig;
