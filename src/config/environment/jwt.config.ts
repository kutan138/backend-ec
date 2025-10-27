import { ConfigType, registerAs } from '@nestjs/config';
import { ConfigModules } from '../types/ConfigModules';

const jwtConfig = registerAs(ConfigModules.Jwt, () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
}));

export type JwtConfig = ConfigType<typeof jwtConfig>;
export default jwtConfig;
