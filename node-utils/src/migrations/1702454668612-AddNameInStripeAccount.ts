import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameInStripeAccount1702454668612 implements MigrationInterface {
  name = 'AddNameInStripeAccount1702454668612';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_stripe_accounts\` ADD \`name\` varchar(100) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_stripe_accounts\` DROP COLUMN \`name\``
    );
  }
}
