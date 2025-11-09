import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'Pass@123' })
  @IsString()
  newPassword: string;
}
