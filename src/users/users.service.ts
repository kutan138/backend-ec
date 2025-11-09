import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async update(
    id: string,
    data: QueryDeepPartialEntity<User>,
  ): Promise<User | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string | number): Promise<void> {
    await this.repo.delete(id);
  }

  async getUserProfile(id: string): Promise<{
    email: User['email'];
    roles: string[];
    permissions: string[];
  } | null> {
    const user = await this.repo.findOne({
      where: { id },
      relations: [
        'roles',
        'roles.permissions', // load permission trong role
        'permissions', // load permission gán trực tiếp cho user
      ],
    });

    if (!user) return null;

    // chỉ lấy name của role
    const roleNames = user.roles?.map((r) => r.name) ?? [];

    // gộp quyền từ role và user
    const rolePermissions =
      user.roles?.flatMap((r) => r.permissions?.map((p) => p.name)) ?? [];
    const userPermissions = user.permissions?.map((p) => p.name) ?? [];

    const allPermissions = Array.from(
      new Set([...rolePermissions, ...userPermissions]),
    );

    return {
      email: user.email,
      roles: roleNames,
      permissions: allPermissions,
    };
  }

  findAll() {
    return this.repo.find();
  }
}
