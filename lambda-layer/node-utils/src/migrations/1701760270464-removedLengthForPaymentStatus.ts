import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovedLengthForPaymentStatus1701760270464
  implements MigrationInterface
{
  name = 'RemovedLengthForPaymentStatus1701760270464';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`payment_source\``
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`payment_source\` varchar(255) NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`payment_source\``
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`payment_source\` varchar(10) NOT NULL`
    );
  }
}
