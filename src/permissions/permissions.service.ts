import { Injectable } from '@nestjs/common';
import { Permission } from './entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly repo: Repository<Permission>,
  ) {}

  async create(data: Partial<Permission>): Promise<Permission> {
    const perm = this.repo.create(data);
    return this.repo.save(perm);
  }

  async createMany(data: Partial<Permission>[]): Promise<Permission[]> {
    const names = data.map((d) => d.name);
    // check tồn tại để tránh duplicate
    const existing = await this.repo.find({ where: { name: In(names) } });

    const newItems = data.filter(
      (d) => !existing.some((e) => e.name === d.name),
    );

    if (!newItems.length) return existing;

    const created = this.repo.create(newItems);
    return [...existing, ...(await this.repo.save(created))];
  }
}
