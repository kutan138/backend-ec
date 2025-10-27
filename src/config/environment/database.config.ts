import { ConfigType, registerAs } from '@nestjs/config';
import { ConfigModules } from '../types/ConfigModules';

const databaseConfig = registerAs(ConfigModules.Database, () => ({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
  name: process.env.DB_NAME,
}));

export type DatabaseConfig = ConfigType<typeof databaseConfig>;
export default databaseConfig;
