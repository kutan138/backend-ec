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

  async validate(payload: {
    sub: string;
    roles: string[];
    permissions: string[];
  }): Promise<
    Pick<User, 'email' | 'fullName' | 'avatar'> & {
      roles: string[];
      permissions: string[];
    }
  > {
    const { roles, permissions, sub } = payload;
    const user = await this.usersService.findById(sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    const { email, fullName, avatar } = user;
    return { email, fullName, avatar, roles, permissions };
  }
}
