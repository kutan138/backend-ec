import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Identity } from './entities/identity.entity';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AppLogger } from 'src/logger/logger.service';
import { TypedConfigService } from 'src/config/TypedConfigService';
import { MailModule } from '../mail/mail.module';

@Module({
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([Identity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [TypedConfigService],
      useFactory: (config: TypedConfigService) => {
        const jwtConfig = config.getJwtConfig();
        return {
          secret: jwtConfig.accessSecret,
          signOptions: {
            expiresIn: Number(jwtConfig.accessExpiresIn),
          },
        };
      },
    }),
    UsersModule,
    MailModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    AppLogger,
  ],
})
export class AuthModule {}
