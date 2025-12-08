import { ApiProperty } from '@nestjs/swagger';
import { Permission } from 'src/permissions/entities/permission.entity';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin', description: 'Role name' })
  name: string;

  @ApiProperty({
    example: [
      { id: '123e4567-e89b-12d3-a456-426614174000', name: 'read:users' },
      { id: '123e4567-e89b-12d3-a456-426614174001', name: 'write:users' },
    ],
    description: 'List of permissions for the role',
    type: [Permission],
    required: false,
  })
  permissions?: Permission[];
}
