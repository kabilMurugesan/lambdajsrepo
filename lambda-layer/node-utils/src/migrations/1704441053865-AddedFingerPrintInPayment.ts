import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedFingerPrintInPayment1704441053865
  implements MigrationInterface
{
  name = 'AddedFingerPrintInPayment1704441053865';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_stripe_accounts\` ADD \`fingerprint\` text NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_stripe_accounts\` DROP COLUMN \`fingerprint\``
    );
  }
}
