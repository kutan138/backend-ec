import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomPermissions1700001000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const permissions = [
      {
        module: 'order',
        action: 'cancel',
        description: 'Cancel order',
      },
      {
        module: 'product',
        action: 'publish',
        description: 'Publish product',
      },
      {
        module: 'user',
        action: 'assign.role',
        description: 'Assign role to user',
      },
    ];

    for (const p of permissions) {
      await queryRunner.query(
        `
        INSERT INTO permissions (module, action, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (module, action) DO NOTHING
        `,
        [p.module, p.action, p.description],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM permissions
      WHERE (module, action) IN (
        ('order', 'cancel'),
        ('product', 'publish'),
        ('user', 'assign.role')
      )
    `);
  }
}
