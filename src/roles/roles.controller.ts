import { Controller, Post } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Permission } from 'src/permissions/entities/permission.entity';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update a role with permissions' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: 201,
    description: 'Role created or updated successfully',
    type: Role,
  })
  createRole(data: { name: string; permissions?: Permission[] }) {
    return this.rolesService.create(data);
  }
}
