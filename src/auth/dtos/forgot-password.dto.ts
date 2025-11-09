import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'letutan500@gmail.com' })
  @IsEmail()
  email: string;
}
