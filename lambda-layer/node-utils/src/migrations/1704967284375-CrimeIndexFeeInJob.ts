import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrimeIndexFeeInJob1704967284375 implements MigrationInterface {
  name = 'CrimeIndexFeeInJob1704967284375';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`crime_rate_commission_percentage\` decimal(10,2) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`crime_rate_commission_cost\` decimal(10,2) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`crime_rate_commission_cost\``
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`crime_rate_commission_percentage\``
    );
  }
}
