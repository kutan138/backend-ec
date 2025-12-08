import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1735689500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for AuthProvider
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "auth_provider_enum" AS ENUM ('local', 'google', 'facebook');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar UNIQUE NOT NULL,
        "fullName" varchar,
        "avatar" varchar,
        "createdAt" timestamp NOT NULL DEFAULT NOW(),
        "updatedAt" timestamp NOT NULL DEFAULT NOW()
      )
    `);

    // Create identities table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "identities" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "providerUserId" varchar,
        "provider" "auth_provider_enum" NOT NULL,
        "passwordHash" varchar,
        "isActive" boolean NOT NULL DEFAULT false,
        "accessToken" text,
        "refreshToken" text,
        "expiresAt" timestamptz,
        "verificationToken" text,
        "verificationTokenExpires" timestamp,
        "resetToken" text,
        "resetTokenExpires" timestamptz,
        "rawProfile" jsonb,
        "userId" uuid NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT NOW(),
        "updatedAt" timestamp NOT NULL DEFAULT NOW(),
        CONSTRAINT "UQ_identities_provider_providerUserId" UNIQUE ("provider", "providerUserId"),
        CONSTRAINT "FK_identities_userId" FOREIGN KEY ("userId") 
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create permissions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "permissions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar UNIQUE NOT NULL,
        "description" text,
        "createdAt" timestamp NOT NULL DEFAULT NOW(),
        "updatedAt" timestamp NOT NULL DEFAULT NOW()
      )
    `);

    // Create roles table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar UNIQUE NOT NULL,
        "description" text,
        "createdAt" timestamp NOT NULL DEFAULT NOW(),
        "updatedAt" timestamp NOT NULL DEFAULT NOW()
      )
    `);

    // Create role_permission junction table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "role_permission" (
        "role_id" uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        PRIMARY KEY ("role_id", "permission_id"),
        CONSTRAINT "FK_role_permission_role_id" FOREIGN KEY ("role_id") 
          REFERENCES "roles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_role_permission_permission_id" FOREIGN KEY ("permission_id") 
          REFERENCES "permissions"("id") ON DELETE CASCADE
      )
    `);

    // Create user_role junction table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_role" (
        "user_id" uuid NOT NULL,
        "role_id" uuid NOT NULL,
        PRIMARY KEY ("user_id", "role_id"),
        CONSTRAINT "FK_user_role_user_id" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_role_role_id" FOREIGN KEY ("role_id") 
          REFERENCES "roles"("id") ON DELETE CASCADE
      )
    `);

    // Create user_permission junction table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_permission" (
        "user_id" uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        PRIMARY KEY ("user_id", "permission_id"),
        CONSTRAINT "FK_user_permission_user_id" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_permission_permission_id" FOREIGN KEY ("permission_id") 
          REFERENCES "permissions"("id") ON DELETE CASCADE
      )
    `);

    // Create categories table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(120) UNIQUE NOT NULL,
        "description" text,
        "createdAt" timestamp NOT NULL DEFAULT NOW(),
        "updatedAt" timestamp NOT NULL DEFAULT NOW()
      )
    `);

    // Create products table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "category_id" uuid,
        "name" varchar(255) NOT NULL,
        "description" text,
        "price" decimal(12,2) NOT NULL,
        "stock" int NOT NULL DEFAULT 0,
        "thumbnail" text,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "updated_at" timestamp NOT NULL DEFAULT NOW(),
        CONSTRAINT "FK_products_category_id" FOREIGN KEY ("category_id") 
          REFERENCES "categories"("id") ON DELETE SET NULL
      )
    `);

    // Create product_images table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_images" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "product_id" uuid NOT NULL,
        "url" text NOT NULL,
        CONSTRAINT "FK_product_images_product_id" FOREIGN KEY ("product_id") 
          REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    // Create carts table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "carts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "updated_at" timestamp NOT NULL DEFAULT NOW(),
        CONSTRAINT "FK_carts_user_id" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create cart_items table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cart_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "cart_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "quantity" int NOT NULL,
        CONSTRAINT "UQ_cart_items_cart_id_product_id" UNIQUE ("cart_id", "product_id"),
        CONSTRAINT "CHK_cart_items_quantity" CHECK ("quantity" > 0),
        CONSTRAINT "FK_cart_items_cart_id" FOREIGN KEY ("cart_id") 
          REFERENCES "carts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cart_items_product_id" FOREIGN KEY ("product_id") 
          REFERENCES "products"("id")
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_identities_userId" ON "identities"("userId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_category_id" ON "products"("category_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_product_images_product_id" ON "product_images"("product_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_carts_user_id" ON "carts"("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cart_items_cart_id" ON "cart_items"("cart_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cart_items_product_id" ON "cart_items"("product_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (respecting foreign key constraints)
    await queryRunner.query(`DROP TABLE IF EXISTS "cart_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "carts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_images"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_permission"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_role"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role_permission"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permissions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "identities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    // Drop enum type
    await queryRunner.query(`DROP TYPE IF EXISTS "auth_provider_enum"`);
  }
}
