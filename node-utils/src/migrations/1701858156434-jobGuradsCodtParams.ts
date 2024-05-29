import { MigrationInterface, QueryRunner } from 'typeorm';

export class JobGuradsCodtParams1701858156434 implements MigrationInterface {
  name = 'JobGuradsCodtParams1701858156434';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job_guards\` ADD \`job_cost_per_hour\` decimal(10,2) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`job_guards\` ADD \`total_job_hours\` decimal(10,2) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`job_guards\` ADD \`total_job_amount\` decimal(10,2) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`job_guards\` ADD \`transfer_status\` int NOT NULL COMMENT '0-PENDING, 1-COMPLETED, 2-FAILED' DEFAULT '0'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job_guards\` DROP COLUMN \`transfer_status\``
    );
    await queryRunner.query(
      `ALTER TABLE \`job_guards\` DROP COLUMN \`total_job_amount\``
    );
    await queryRunner.query(
      `ALTER TABLE \`job_guards\` DROP COLUMN \`total_job_hours\``
    );
    await queryRunner.query(
      `ALTER TABLE \`job_guards\` DROP COLUMN \`job_cost_per_hour\``
    );
  }
}
