import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedPaymentChargeDetails1704366634275
  implements MigrationInterface
{
  name = 'AddedPaymentChargeDetails1704366634275';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`payment_charge_status\` varchar(255) NOT NULL DEFAULT 'pending'`
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`payment_charge_id\` varchar(255) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`balance_transaction_id\` varchar(255) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`balance_transaction_id\``
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`payment_charge_id\``
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`payment_charge_status\``
    );
  }
}
