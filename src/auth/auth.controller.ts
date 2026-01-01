import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from 'src/common/interfaces/current-user.interface';
import { AuthService } from './auth.service';
import { ActiveDto } from './dtos/active.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { LoginDto } from './dtos/login.dto';
import { MessageResponseDto } from './dtos/message-response.dto';
import { RegisterDto } from './dtos/register.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { TokenResponseDto } from './dtos/token-response.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-auth-refresh.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: TokenResponseDto,
  })
  async login(@CurrentUser() user: ICurrentUser): Promise<TokenResponseDto> {
    const userId = user.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    const token = await this.authService.generateTokens({ id: userId });
    return token;
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: UserResponseDto,
  })
  async register(@Body() registerDto: RegisterDto): Promise<UserResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('active')
  @ApiOperation({ summary: 'Activate user account' })
  @ApiBody({ type: ActiveDto })
  @ApiResponse({
    status: 200,
    description: 'Account activated successfully',
    type: UserResponseDto,
  })
  async active(@Body() activeDto: ActiveDto): Promise<UserResponseDto> {
    return this.authService.activeAccount(activeDto.token);
  }

  @Post('refresh')
  @ApiBearerAuth('refresh-token')
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: TokenResponseDto,
  })
  async refresh(@CurrentUser() user: ICurrentUser): Promise<TokenResponseDto> {
    if (!user.id) {
      throw new UnauthorizedException();
    }

    return this.authService.generateTokens({ id: user.id });
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth authentication' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google OAuth',
  })
  async googleAuth() {
    // Passport sẽ tự động redirect đến Google,
    // nên hàm này có thể để trống.
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: 200,
    description: 'Google authentication successful',
    type: TokenResponseDto,
  })
  async googleAuthRedirect(
    @CurrentUser() user: ICurrentUser,
  ): Promise<TokenResponseDto> {
    if (!user.id) {
      throw new Error('User ID is required');
    }
    const { accessToken, refreshToken } = await this.authService.generateTokens(
      { id: user.id },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent if email exists',
    type: MessageResponseDto,
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<MessageResponseDto> {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return { message: 'Nếu email tồn tại, link reset password đã gửi' };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: MessageResponseDto,
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<MessageResponseDto> {
    await this.authService.resetPassword(
      resetPasswordDto.newPassword,
      resetPasswordDto.token,
    );
    return { message: 'Check mail đổi mật khẩu thành công' };
  }
}
