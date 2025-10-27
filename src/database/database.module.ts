import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypedConfigService } from 'src/config/TypedConfigService';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [TypedConfigService],
      useFactory: (typedConfigService: TypedConfigService) => {
        const dbConfig = typedConfigService.getDatabaseConfig();
        const isLocal = typedConfigService.isLocal();
        const isProduction = typedConfigService.isProduction();

        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.user,
          password: dbConfig.pass,
          database: dbConfig.name,
          autoLoadEntities: true,
          synchronize: isLocal,
          logging: isProduction,
        };
      },
    }),
  ],
})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    try {
      await this.dataSource.query('SELECT 1');
      this.logger.log('✅ Database connected successfully');
    } catch (err) {
      this.logger.error('❌ Database connection failed', err);
      throw err;
    }
  }
}
