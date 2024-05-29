import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddingJobReasonInGuards1696934220538
  implements MigrationInterface
{
  name = 'AddingJobReasonInGuards1696934220538';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`booking_reason\` varchar(255) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`booking_reason\``
    );
  }
}
