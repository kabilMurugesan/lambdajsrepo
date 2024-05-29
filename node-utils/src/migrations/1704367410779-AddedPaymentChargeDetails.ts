import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedPaymentChargeDetails1704367410779
  implements MigrationInterface
{
  name = 'AddedPaymentChargeDetails1704367410779';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`capture_status\` tinyint NULL DEFAULT 0`
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`paid_status\` tinyint NULL DEFAULT 0`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`paid_status\``);
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`capture_status\``
    );
  }
}
