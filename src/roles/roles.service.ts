import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/permissions/entities/permission.entity';
import { In, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly repo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async create(data: CreateRoleDto): Promise<Role> {
    const role = await this.repo.findOne({
      where: { name: data.name },
      relations: ['permissions'],
    });

    // Load permissions from database if provided
    let permissions: Permission[] = [];
    if (data.permissions && data.permissions.length > 0) {
      permissions = await this.permissionRepo.find({
        where: { id: In(data.permissions) },
      });
    }

    if (role) {
      // Update existing role with new permissions
      if (permissions.length > 0) {
        const existingPermissionIds = new Set(
          role.permissions.map((p) => p.id),
        );
        const newPermissions = permissions.filter(
          (p) => !existingPermissionIds.has(p.id),
        );
        role.permissions = [...role.permissions, ...newPermissions];
      }

      // Update description if provided
      if (data.description !== undefined) {
        role.description = data.description;
      }

      return this.repo.save(role);
    }

    // Create new role
    const newRole = this.repo.create({
      name: data.name,
      description: data.description,
      permissions,
    });
    return this.repo.save(newRole);
  }
}
