import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStatusFieldInPaymentAccounts1701155852841
  implements MigrationInterface
{
  name = 'UpdateStatusFieldInPaymentAccounts1701155852841';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_stripe_accounts\` DROP COLUMN \`status\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_stripe_accounts\` ADD \`status\` int NOT NULL COMMENT '0-INACTIVE, 1-ACTIVE, 2-DELETED' DEFAULT '1'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_stripe_accounts\` DROP COLUMN \`status\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_stripe_accounts\` ADD \`status\` tinyint NOT NULL DEFAULT '1'`
    );
  }
}
