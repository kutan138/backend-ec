import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly repo: Repository<Role>,
  ) {}

  async create(data: {
    name: string;
    permissions?: Permission[];
  }): Promise<Role> {
    let role = await this.repo.findOne({
      where: { name: data.name },
      relations: ['permissions'],
    });

    if (role) {
      if (data.permissions?.length) {
        role.permissions = [
          ...new Set([...role.permissions, ...data.permissions]),
        ];
        return this.repo.save(role);
      }
      return role;
    }

    role = this.repo.create(data);
    return this.repo.save(role);
  }
}
