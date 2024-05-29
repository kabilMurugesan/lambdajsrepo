import { MigrationInterface, QueryRunner } from 'typeorm';

export class Min4HrAdditionalCost1706516183839 implements MigrationInterface {
  name = 'Min4HrAdditionalCost1706516183839';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`minimum_time_extra_cost\` decimal(10,2) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`minimum_time_extra_cost\``
    );
  }
}
