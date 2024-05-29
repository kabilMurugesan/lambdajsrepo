import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatedStripeAccountIdFieldName1701079430394
  implements MigrationInterface
{
  name = 'UpdatedStripeAccountIdFieldName1701079430394';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_stripe_accounts\` DROP COLUMN \`type\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_stripe_accounts\` ADD \`account_type\` varchar(20) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_stripe_accounts\` ADD \`stripe_account_id\` text NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_stripe_accounts\` DROP COLUMN \`stripe_account_id\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_stripe_accounts\` DROP COLUMN \`account_type\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_stripe_accounts\` ADD \`type\` varchar(20) NULL`
    );
  }
}
