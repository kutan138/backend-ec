import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import { ActiveDto } from './dtos/active.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  async login(@CurrentUser() user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const token = await this.authService.generateTokens(user);
    return token;
  }

  @Post('register')
  @ApiBody({ type: RegisterDto })
  register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.authService.register(registerDto);
  }

  @Post('active')
  @ApiBody({ type: ActiveDto })
  active(@Body() activeDto: ActiveDto): Promise<User> {
    return this.authService.activeAccount(activeDto.token);
  }

  @Post('refresh')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async refresh(@CurrentUser() user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const token = await this.authService.generateTokens(user);
    return token;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Passport sẽ tự động redirect đến Google,
    // nên hàm này có thể để trống.
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@CurrentUser() user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { accessToken, refreshToken } =
      await this.authService.generateTokens(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  @Post('forgot-password')
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body('email') email: string) {
    await this.authService.forgotPassword(email);
    return { message: 'Nếu email tồn tại, link reset password đã gửi' };
  }

  @Post('reset-password')
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authService.resetPassword(newPassword, token);
    return { message: 'Check mail đổi mật khẩu thành công' };
  }
}
