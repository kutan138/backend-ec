// src/config/environment.ts
import { IsEmail, IsEnum, IsInt, IsString, Min } from 'class-validator';

export enum NodeEnv {
  Local = 'local',
  Staging = 'staging',
  Production = 'production',
}

export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Local;

  //APP
  @IsString()
  APP_DOMAIN: string;

  // Database
  @IsInt()
  @Min(1)
  PORT: number = 5432;

  @IsString()
  DB_HOST: string;

  @IsInt()
  DB_PORT: number = 5432;

  @IsString()
  DB_USER: string;

  @IsString()
  DB_PASS: string;

  @IsString()
  DB_NAME: string;

  // JWT
  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_ACCESS_EXPIRES_IN: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string;

  //GOOGLE
  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsString()
  GOOGLE_CALLBACK_URL: string;

  @IsEmail()
  MAIL_USER: string;

  @IsString()
  MAIL_PASS: string;

  @IsInt()
  SMTP_PORT: number;
}
