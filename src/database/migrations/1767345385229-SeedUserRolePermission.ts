/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as argon2 from 'argon2';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { AuthProvider } from 'src/auth/enums/AuthProvider';

export class SeedRbacSafe1736200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * 0. CLEAN DEV DATA (AN TOÀN FK)
     */
    await queryRunner.query(`DELETE FROM role_permission`);
    await queryRunner.query(`DELETE FROM user_role`);
    await queryRunner.query(`DELETE FROM identities`);
    await queryRunner.query(`DELETE FROM users`);
    await queryRunner.query(`DELETE FROM roles`);
    await queryRunner.query(`DELETE FROM permissions`);

    /**
     * 1. SEED PERMISSIONS (module + action)
     */
    await queryRunner.query(`
      INSERT INTO permissions (id, module, action, description, "isSystem", "createdAt", "updatedAt")
      VALUES
        (gen_random_uuid(), 'user', 'read', 'Xem người dùng', true, NOW(), NOW()),
        (gen_random_uuid(), 'user', 'create', 'Tạo người dùng', true, NOW(), NOW()),
        (gen_random_uuid(), 'user', 'update', 'Cập nhật người dùng', true, NOW(), NOW()),
        (gen_random_uuid(), 'user', 'delete', 'Xóa người dùng', true, NOW(), NOW()),

        (gen_random_uuid(), 'product', 'read', 'Xem sản phẩm', true, NOW(), NOW()),
        (gen_random_uuid(), 'product', 'create', 'Tạo sản phẩm', true, NOW(), NOW()),
        (gen_random_uuid(), 'product', 'update', 'Cập nhật sản phẩm', true, NOW(), NOW()),
        (gen_random_uuid(), 'product', 'delete', 'Xóa sản phẩm', true, NOW(), NOW()),

        (gen_random_uuid(), 'order', 'read', 'Xem đơn hàng', true, NOW(), NOW()),
        (gen_random_uuid(), 'order', 'update', 'Cập nhật đơn hàng', true, NOW(), NOW())
    `);

    /**
     * 2. SEED ROLES
     */
    await queryRunner.query(`
      INSERT INTO roles (id, name, description, "createdAt", "updatedAt")
      VALUES
        (gen_random_uuid(), 'ADMIN', 'Toàn quyền hệ thống', NOW(), NOW()),
        (gen_random_uuid(), 'SELLER', 'Người bán', NOW(), NOW()),
        (gen_random_uuid(), 'CUSTOMER', 'Khách hàng', NOW(), NOW())
    `);

    /**
     * 3. LOAD DATA (BẮT BUỘC CHECK)
     */
    const roles = await queryRunner.query(`SELECT * FROM roles`);
    console.log('🚀 ~ SeedRbacSafe1736200000000 ~ up ~ roles:', roles);
    const permissions = await queryRunner.query(`SELECT * FROM permissions`);
    console.log(
      '🚀 ~ SeedRbacSafe1736200000000 ~ up ~ permissions:',
      permissions,
    );

    const adminRole = roles.find((r) => r.name === 'ADMIN');
    const sellerRole = roles.find((r) => r.name === 'SELLER');
    const customerRole = roles.find((r) => r.name === 'CUSTOMER');

    if (!adminRole || !sellerRole || !customerRole) {
      throw new Error('Roles seed failed');
    }

    if (permissions.length === 0) {
      throw new Error('Permissions seed failed');
    }

    /**
     * 4. ROLE → PERMISSION
     */

    // ADMIN: full quyền
    for (const p of permissions) {
      await queryRunner.query(
        `
        INSERT INTO role_permission (role_id, permission_id)
        VALUES ($1, $2)
        `,
        [adminRole.id, p.id],
      );
    }

    // SELLER
    for (const p of permissions.filter(
      (p) =>
        (p.module === 'product' &&
          ['read', 'create', 'update'].includes(p.action)) ||
        (p.module === 'order' && p.action === 'read'),
    )) {
      await queryRunner.query(
        `
        INSERT INTO role_permission (role_id, permission_id)
        VALUES ($1, $2)
        `,
        [sellerRole.id, p.id],
      );
    }

    // CUSTOMER
    for (const p of permissions.filter(
      (p) => p.module === 'order' && p.action === 'read',
    )) {
      await queryRunner.query(
        `
        INSERT INTO role_permission (role_id, permission_id)
        VALUES ($1, $2)
        `,
        [customerRole.id, p.id],
      );
    }

    /**
     * 5. SEED USERS
     */
    const users = [
      {
        email: 'letutan500@gmail.com',
        fullName: 'Super Admin',
        password: '1',
        role_id: adminRole.id,
      },
      {
        email: 'seller@example.com',
        fullName: 'Test Seller',
        password: '1',
        role_id: sellerRole.id,
      },
      {
        email: 'customer@example.com',
        fullName: 'Test Customer',
        password: '1',
        role_id: customerRole.id,
      },
    ];

    for (const u of users) {
      const [user] = await queryRunner.query(
        `
        INSERT INTO users (email, "fullName", "createdAt", "updatedAt")
        VALUES ($1, $2, NOW(), NOW())
        RETURNING id
        `,
        [u.email, u.fullName],
      );

      const passwordHash = await argon2.hash(u.password);

      await queryRunner.query(
        `
        INSERT INTO identities
          (id, provider, "providerUserId", "passwordHash", "isActive", "userId", "createdAt", "updatedAt")
        VALUES
          (gen_random_uuid(), $1, $2, $3, true, $4, NOW(), NOW())
        `,
        [AuthProvider.LOCAL, u.email, passwordHash, user.id],
      );

      await queryRunner.query(
        `
        INSERT INTO user_role (user_id, role_id)
        VALUES ($1, $2)
        `,
        [user.id, u.role_id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM user_role`);
    await queryRunner.query(`DELETE FROM role_permission`);
    await queryRunner.query(`DELETE FROM identities`);
    await queryRunner.query(`DELETE FROM users`);
    await queryRunner.query(`DELETE FROM roles`);
    await queryRunner.query(`DELETE FROM permissions`);
  }
}
