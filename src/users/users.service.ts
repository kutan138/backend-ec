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

  findAll() {
    return this.repo.find();
  }

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
}
