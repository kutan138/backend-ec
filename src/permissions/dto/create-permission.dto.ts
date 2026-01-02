import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'user.view',
    description: 'Permission key (module.action)',
  })
  @Matches(/^[a-z]+\.[a-z]+$/, {
    message: 'key phải theo dạng module.action (vd: user.view)',
  })
  name: string;

  @ApiProperty({
    example: 'Xem danh sách người dùng',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: false,
    required: false,
    description: 'Đánh dấu permission hệ thống',
  })
  @IsOptional()
  isSystem?: boolean;
}
