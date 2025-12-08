import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'read:users',
    description: 'Permission name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Read users permission',
    description: 'Permission description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
