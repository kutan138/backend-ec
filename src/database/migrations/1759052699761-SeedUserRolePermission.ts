/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as argon2 from 'argon2';
import { AuthProvider } from 'src/auth/enums/AuthProvider';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUserRolePermission1759052699761 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert permissions
    await queryRunner.query(`
      INSERT INTO permissions (id, name, description)
      VALUES
        (gen_random_uuid(), 'user.manage', 'Quản lý user'),
        (gen_random_uuid(), 'product.create', 'Tạo sản phẩm'),
        (gen_random_uuid(), 'product.update', 'Sửa sản phẩm'),
        (gen_random_uuid(), 'product.delete', 'Xóa sản phẩm'),
        (gen_random_uuid(), 'order.view', 'Xem đơn hàng'),
        (gen_random_uuid(), 'order.manage', 'Quản lý đơn hàng')
    `);

    // Insert roles
    await queryRunner.query(`
      INSERT INTO roles (id, name, description)
      VALUES
        (gen_random_uuid(), 'ADMIN', 'Toàn quyền hệ thống'),
        (gen_random_uuid(), 'SELLER', 'Người bán'),
        (gen_random_uuid(), 'CUSTOMER', 'Khách hàng')
    `);

    // Lấy id role & permission
    const roles = await queryRunner.query(`SELECT * FROM roles`);
    const perms = await queryRunner.query(`SELECT * FROM permissions`);

    const adminRole = roles.find((r) => r.name === 'ADMIN');
    const sellerRole = roles.find((r) => r.name === 'SELLER');
    const customerRole = roles.find((r) => r.name === 'CUSTOMER');

    // Gán full quyền cho admin
    for (const p of perms) {
      await queryRunner.query(
        `
        INSERT INTO role_permission (role_id, permission_id)
        VALUES ($1, $2)
      `,
        [adminRole.id, p.id],
      );
    }

    // Gán quyền cho seller
    for (const p of perms.filter((p) =>
      ['product.create', 'product.update', 'order.view'].includes(p.name),
    )) {
      await queryRunner.query(
        `
        INSERT INTO role_permission (role_id, permission_id)
        VALUES ($1, $2)
      `,
        [sellerRole.id, p.id],
      );
    }

    // Gán quyền cho customer
    for (const p of perms.filter((p) => ['order.view'].includes(p.name))) {
      await queryRunner.query(
        `
        INSERT INTO role_permission (role_id, permission_id)
        VALUES ($1, $2)
      `,
        [customerRole.id, p.id],
      );
    }

    // Tạo admin user
    const [adminUser] = await queryRunner.query(
      ` INSERT INTO users (email, "fullName", avatar, "createdAt", "updatedAt") 
        VALUES ($1, $2, null, NOW(), NOW()) 
        RETURNING id 
    `,
      ['admin@example.com', 'Super Admin'],
    );

    // Tạo identity cho admin user
    const passwordHash = await argon2.hash('1');
    await queryRunner.query(
      `
        INSERT INTO identities ( provider, "providerUserId", "passwordHash", "isActive", "userId", "createdAt", "updatedAt" ) 
        VALUES ($1, $2, $3, true, $4, NOW(), NOW()) 
    `,
      [AuthProvider.LOCAL, 'admin@example.com', passwordHash, adminUser.id],
    );

    // Gán role ADMIN cho user
    await queryRunner.query(
      `
      INSERT INTO user_role ("user_id", role_id)
      VALUES ($1, $2)
    `,
      [adminUser.id, adminRole.id],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM user_role`);
    await queryRunner.query(`DELETE FROM role_permission`);
    await queryRunner.query(`DELETE FROM user_permission`);
    await queryRunner.query(`DELETE FROM users`);
    await queryRunner.query(`DELETE FROM roles`);
    await queryRunner.query(`DELETE FROM permissions`);
  }
}
