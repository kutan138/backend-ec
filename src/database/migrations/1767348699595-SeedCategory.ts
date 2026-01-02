/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCategory1767348699595 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Parent categories
    await queryRunner.query(
      `
      INSERT INTO categories (name, description, "order")
      VALUES
        ('Electronics', 'Electronic products', 1),
        ('Fashion', 'Fashion products', 2)
      ON CONFLICT (name) DO NOTHING
      `,
    );

    // 2. Lấy id parent
    const [electronics] = await queryRunner.query(
      `SELECT id FROM categories WHERE name = 'Electronics'`,
    );
    const [fashion] = await queryRunner.query(
      `SELECT id FROM categories WHERE name = 'Fashion'`,
    );

    // 3. Child categories
    await queryRunner.query(
      `
      INSERT INTO categories (name, description, "parentId", "order")
      VALUES
        ('Phones', 'Mobile phones', $1, 1),
        ('Laptops', 'Laptop computers', $1, 2),
        ('Accessories', 'Electronic accessories', $1, 3)
      ON CONFLICT (name) DO NOTHING
      `,
      [electronics.id],
    );

    await queryRunner.query(
      `
      INSERT INTO categories (name, description, "parentId", "order")
      VALUES
        ('Men', 'Men fashion', $1, 1),
        ('Women', 'Women fashion', $1, 2)
      ON CONFLICT (name) DO NOTHING
      `,
      [fashion.id],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM categories
      WHERE name IN (
        'Phones',
        'Laptops',
        'Accessories',
        'Men',
        'Women',
        'Electronics',
        'Fashion'
      )
    `);
  }
}
