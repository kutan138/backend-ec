import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TypedConfigService } from 'src/config/TypedConfigService';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: TypedConfigService,
    private usersService: UsersService,
  ) {
    const jwtConfig = configService.getJwtConfig();
    const ExtractJwtTyped = ExtractJwt as {
      fromAuthHeaderAsBearerToken: () => (req: any) => string | null;
    };
    const tokenExtractor = ExtractJwtTyped.fromAuthHeaderAsBearerToken();

    super({
      jwtFromRequest: tokenExtractor,
      ignoreExpiration: false,
      secretOrKey: jwtConfig.accessSecret,
    });
  }

  async validate(payload: { sub: string; email: string }): Promise<User> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
