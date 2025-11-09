import { WinstonModuleOptions } from 'nest-winston';
import { createConsoleTransport } from './transports.console';
import { createFileTransports } from './transports.file';
import { NodeEnv } from 'src/config/environment';

export const createLoggerConfig = (env: NodeEnv): WinstonModuleOptions => {
  const isDev = env === NodeEnv.Local;
  const isStaging = env === NodeEnv.Staging;
  const isProd = env === NodeEnv.Production;

  return {
    transports: [
      createConsoleTransport(isDev),
      ...(isStaging || isProd ? createFileTransports() : []),
    ],
  };
};
