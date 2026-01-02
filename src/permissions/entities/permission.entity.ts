// permissions/entities/permission.entity.ts
import { Role } from 'src/roles/entities/role.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('permissions')
export class Permission {
  @ApiProperty({
    example: 'uuid-v4',
    description: 'ID permission',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'user.view',
    description: 'Permission key theo dạng module.action',
  })
  @Index({ unique: true })
  @Column()
  name: string;

  @ApiProperty({
    example: 'Xem danh sách người dùng',
    required: false,
  })
  @Column({ nullable: true })
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

  // ❌ Không expose roles/users trong swagger response
  // => tránh vòng lặp & payload to
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @ManyToMany(() => User, (user) => user.permissions)
  users: User[];
}
