// permissions/entities/permission.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { PermissionAction, PermissionActionEnumName } from 'src/database/enums';
import { Role } from 'src/roles/entities/role.entity';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('permissions')
@Index(['module', 'action'], { unique: true })
export class Permission {
  @ApiProperty({
    example: 'uuid-v4',
    description: 'ID permission',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'user:view',
    description:
      'Permission key theo định dạng <module>:<action> (ví dụ: user:view, post:create, user:*)',
  })
  @Column({ unique: true, length: 100 })
  key: string;

  @ApiProperty({
    example: 'user',
    description: 'Module',
  })
  @Column({ length: 50 })
  module: string;

  @ApiProperty({
    example: PermissionAction.READ,
    enum: PermissionAction,
    description: 'Hành động CRUD',
  })
  @Column({
    type: 'enum',
    enum: PermissionAction,
    enumName: PermissionActionEnumName,
  })
  action: PermissionAction;

  @ApiProperty({
    example: 'Xem danh sách người dùng',
    required: true,
  })
  @Column({ nullable: false, type: 'text' })
  description: string;

  @ApiProperty({
    example: false,
    description: 'Permission hệ thống (readonly)',
  })
  @Column({ default: false })
  isSystem: boolean;

  @ApiProperty({
    example: '2026-01-01T10:00:00Z',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    example: '2026-01-01T10:05:00Z',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @ManyToMany(() => User, (user) => user.permissions)
  users: User[];

  @BeforeInsert()
  @BeforeUpdate()
  syncKey() {
    this.key = `${this.module}:${this.action}`;
  }
}
