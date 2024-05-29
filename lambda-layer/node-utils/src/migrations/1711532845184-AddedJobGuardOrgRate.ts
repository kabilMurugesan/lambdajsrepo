import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedJobGuardOrgRate1711532845184 implements MigrationInterface {
  name = 'AddedJobGuardOrgRate1711532845184';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job_guards\` ADD \`job_org_cost_per_hour\` decimal(10,2) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job_guards\` DROP COLUMN \`job_org_cost_per_hour\``
    );
  }
}
