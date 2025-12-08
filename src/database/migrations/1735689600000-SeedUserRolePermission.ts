/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as argon2 from 'argon2';
import { AuthProvider } from 'src/auth/enums/AuthProvider';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUserRolePermission1735689600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert permissions
    await queryRunner.query(`
      INSERT INTO permissions (id, name, description, "createdAt", "updatedAt")
      VALUES
        (gen_random_uuid(), 'user.manage', 'Quản lý user', NOW(), NOW()),
        (gen_random_uuid(), 'product.create', 'Tạo sản phẩm', NOW(), NOW()),
        (gen_random_uuid(), 'product.update', 'Sửa sản phẩm', NOW(), NOW()),
        (gen_random_uuid(), 'product.delete', 'Xóa sản phẩm', NOW(), NOW()),
        (gen_random_uuid(), 'order.view', 'Xem đơn hàng', NOW(), NOW()),
        (gen_random_uuid(), 'order.manage', 'Quản lý đơn hàng', NOW(), NOW())
      ON CONFLICT (name) DO NOTHING
    `);

    // Insert roles
    await queryRunner.query(`
      INSERT INTO roles (id, name, description, "createdAt", "updatedAt")
      VALUES
        (gen_random_uuid(), 'ADMIN', 'Toàn quyền hệ thống', NOW(), NOW()),
        (gen_random_uuid(), 'SELLER', 'Người bán', NOW(), NOW()),
        (gen_random_uuid(), 'CUSTOMER', 'Khách hàng', NOW(), NOW())
      ON CONFLICT (name) DO NOTHING
    `);

    // Lấy id role & permission
    const roles = await queryRunner.query(`SELECT * FROM roles`);
    const perms = await queryRunner.query(`SELECT * FROM permissions`);

    const adminRole = roles.find((r) => r.name === 'ADMIN');
    const sellerRole = roles.find((r) => r.name === 'SELLER');
    const customerRole = roles.find((r) => r.name === 'CUSTOMER');

    if (!adminRole || !sellerRole || !customerRole) {
      throw new Error('Roles not found');
    }

    // Gán full quyền cho admin
    for (const p of perms) {
      await queryRunner.query(
        `
        INSERT INTO role_permission (role_id, permission_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
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
        ON CONFLICT DO NOTHING
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
        ON CONFLICT DO NOTHING
      `,
        [customerRole.id, p.id],
      );
    }

    // Kiểm tra xem admin user đã tồn tại chưa
    const existingAdmin = await queryRunner.query(
      `SELECT id FROM users WHERE email = $1`,
      ['letutan500@gmail.com'],
    );

    if (existingAdmin.length === 0) {
      // Tạo admin user
      const [adminUser] = await queryRunner.query(
        ` INSERT INTO users (id, email, "fullName", avatar, "createdAt", "updatedAt") 
          VALUES (gen_random_uuid(), $1, $2, null, NOW(), NOW()) 
          RETURNING id 
      `,
        ['letutan500@gmail.com', 'Super Admin'],
      );

      // Tạo identity cho admin user
      const passwordHash = await argon2.hash('1');
      await queryRunner.query(
        `
          INSERT INTO identities (id, provider, "providerUserId", "passwordHash", "isActive", "userId", "createdAt", "updatedAt") 
          VALUES (gen_random_uuid(), $1, $2, $3, true, $4, NOW(), NOW()) 
      `,
        [
          AuthProvider.LOCAL,
          'letutan500@gmail.com',
          passwordHash,
          adminUser.id,
        ],
      );

      // Gán role ADMIN cho user
      await queryRunner.query(
        `
        INSERT INTO user_role ("user_id", role_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `,
        [adminUser.id, adminRole.id],
      );
    }

    // Insert categories
    await queryRunner.query(`
      INSERT INTO categories (id, name, description, "createdAt", "updatedAt")
      VALUES
        (gen_random_uuid(), 'Electronics', 'Electronic devices and accessories', NOW(), NOW()),
        (gen_random_uuid(), 'Clothing', 'Apparel and fashion items', NOW(), NOW()),
        (gen_random_uuid(), 'Books', 'Books and reading materials', NOW(), NOW()),
        (gen_random_uuid(), 'Home & Garden', 'Home improvement and garden supplies', NOW(), NOW()),
        (gen_random_uuid(), 'Sports & Outdoors', 'Sports equipment and outdoor gear', NOW(), NOW())
      ON CONFLICT (name) DO NOTHING
    `);

    // Get category IDs
    const categories = await queryRunner.query(`SELECT * FROM categories`);
    const electronicsCategory = categories.find(
      (c) => c.name === 'Electronics',
    );
    const clothingCategory = categories.find((c) => c.name === 'Clothing');
    const booksCategory = categories.find((c) => c.name === 'Books');

    // Insert products
    if (electronicsCategory) {
      const [product1] = await queryRunner.query(
        `
        INSERT INTO products (id, category_id, name, description, price, stock, thumbnail, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, 'iPhone 15 Pro Max', 'Latest iPhone with advanced features', 1299.99, 50, 'https://example.com/iphone15.jpg', NOW(), NOW())
        RETURNING id
      `,
        [electronicsCategory.id],
      );

      // Insert product images for iPhone
      if (product1) {
        await queryRunner.query(
          `
          INSERT INTO product_images (id, product_id, url)
          VALUES
            (gen_random_uuid(), $1, 'https://example.com/iphone15-1.jpg'),
            (gen_random_uuid(), $1, 'https://example.com/iphone15-2.jpg'),
            (gen_random_uuid(), $1, 'https://example.com/iphone15-3.jpg')
        `,
          [product1.id],
        );
      }

      await queryRunner.query(
        `
        INSERT INTO products (id, category_id, name, description, price, stock, thumbnail, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, 'Samsung Galaxy S24 Ultra', 'Premium Android smartphone', 1199.99, 30, 'https://example.com/galaxy-s24.jpg', NOW(), NOW())
        ON CONFLICT DO NOTHING
      `,
        [electronicsCategory.id],
      );

      await queryRunner.query(
        `
        INSERT INTO products (id, category_id, name, description, price, stock, thumbnail, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, 'MacBook Pro 16"', 'Powerful laptop for professionals', 2499.99, 20, 'https://example.com/macbook-pro.jpg', NOW(), NOW())
        ON CONFLICT DO NOTHING
      `,
        [electronicsCategory.id],
      );
    }

    if (clothingCategory) {
      await queryRunner.query(
        `
        INSERT INTO products (id, category_id, name, description, price, stock, thumbnail, created_at, updated_at)
        VALUES
          (gen_random_uuid(), $1, 'Cotton T-Shirt', 'Comfortable cotton t-shirt', 29.99, 100, 'https://example.com/tshirt.jpg', NOW(), NOW()),
          (gen_random_uuid(), $1, 'Denim Jeans', 'Classic blue denim jeans', 79.99, 75, 'https://example.com/jeans.jpg', NOW(), NOW()),
          (gen_random_uuid(), $1, 'Winter Jacket', 'Warm winter jacket', 149.99, 40, 'https://example.com/jacket.jpg', NOW(), NOW())
        ON CONFLICT DO NOTHING
      `,
        [clothingCategory.id],
      );
    }

    if (booksCategory) {
      await queryRunner.query(
        `
        INSERT INTO products (id, category_id, name, description, price, stock, thumbnail, created_at, updated_at)
        VALUES
          (gen_random_uuid(), $1, 'The Great Gatsby', 'Classic American novel', 12.99, 200, 'https://example.com/gatsby.jpg', NOW(), NOW()),
          (gen_random_uuid(), $1, 'Clean Code', 'Software development best practices', 49.99, 150, 'https://example.com/cleancode.jpg', NOW(), NOW()),
          (gen_random_uuid(), $1, 'Design Patterns', 'Gang of Four design patterns', 59.99, 100, 'https://example.com/designpatterns.jpg', NOW(), NOW())
        ON CONFLICT DO NOTHING
      `,
        [booksCategory.id],
      );
    }

    // Create seller user
    const existingSeller = await queryRunner.query(
      `SELECT id FROM users WHERE email = $1`,
      ['seller@example.com'],
    );

    if (existingSeller.length === 0 && sellerRole) {
      const [sellerUser] = await queryRunner.query(
        ` INSERT INTO users (id, email, "fullName", avatar, "createdAt", "updatedAt") 
          VALUES (gen_random_uuid(), $1, $2, null, NOW(), NOW()) 
          RETURNING id 
      `,
        ['seller@example.com', 'Test Seller'],
      );

      if (sellerUser) {
        const sellerPasswordHash = await argon2.hash('seller123');
        await queryRunner.query(
          `
          INSERT INTO identities (id, provider, "providerUserId", "passwordHash", "isActive", "userId", "createdAt", "updatedAt") 
          VALUES (gen_random_uuid(), $1, $2, $3, true, $4, NOW(), NOW()) 
        `,
          [
            AuthProvider.LOCAL,
            'seller@example.com',
            sellerPasswordHash,
            sellerUser.id,
          ],
        );

        await queryRunner.query(
          `
          INSERT INTO user_role ("user_id", role_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `,
          [sellerUser.id, sellerRole.id],
        );
      }
    }

    // Create customer user
    const existingCustomer = await queryRunner.query(
      `SELECT id FROM users WHERE email = $1`,
      ['customer@example.com'],
    );

    if (existingCustomer.length === 0 && customerRole) {
      const [customerUser] = await queryRunner.query(
        ` INSERT INTO users (id, email, "fullName", avatar, "createdAt", "updatedAt") 
          VALUES (gen_random_uuid(), $1, $2, null, NOW(), NOW()) 
          RETURNING id 
      `,
        ['customer@example.com', 'Test Customer'],
      );

      if (customerUser) {
        const customerPasswordHash = await argon2.hash('customer123');
        await queryRunner.query(
          `
          INSERT INTO identities (id, provider, "providerUserId", "passwordHash", "isActive", "userId", "createdAt", "updatedAt") 
          VALUES (gen_random_uuid(), $1, $2, $3, true, $4, NOW(), NOW()) 
        `,
          [
            AuthProvider.LOCAL,
            'customer@example.com',
            customerPasswordHash,
            customerUser.id,
          ],
        );

        await queryRunner.query(
          `
          INSERT INTO user_role ("user_id", role_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `,
          [customerUser.id, customerRole.id],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa cart items và carts
    await queryRunner.query(`DELETE FROM cart_items`);
    await queryRunner.query(`DELETE FROM carts`);

    // Xóa product images và products
    await queryRunner.query(`DELETE FROM product_images`);
    await queryRunner.query(`DELETE FROM products`);

    // Xóa categories
    await queryRunner.query(
      `DELETE FROM categories WHERE name IN ('Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports & Outdoors')`,
    );

    // Xóa test users và identities
    await queryRunner.query(
      `DELETE FROM identities WHERE "providerUserId" IN ('letutan500@gmail.com', 'seller@example.com', 'customer@example.com')`,
    );
    await queryRunner.query(
      `DELETE FROM users WHERE email IN ('letutan500@gmail.com', 'seller@example.com', 'customer@example.com')`,
    );

    // Xóa role-permission relationships
    await queryRunner.query(`DELETE FROM role_permission`);
    await queryRunner.query(`DELETE FROM user_permission`);

    // Xóa roles và permissions
    await queryRunner.query(
      `DELETE FROM roles WHERE name IN ('ADMIN', 'SELLER', 'CUSTOMER')`,
    );
    await queryRunner.query(
      `DELETE FROM permissions WHERE name IN ('user.manage', 'product.create', 'product.update', 'product.delete', 'order.view', 'order.manage')`,
    );
  }
}
