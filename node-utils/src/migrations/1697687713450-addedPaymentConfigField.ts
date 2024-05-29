import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedPaymentConfigField1697687713450
  implements MigrationInterface
{
  name = 'AddedPaymentConfigField1697687713450';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`is_payment_configured\` tinyint NULL DEFAULT 0`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP COLUMN \`is_payment_configured\``
    );
  }
}
