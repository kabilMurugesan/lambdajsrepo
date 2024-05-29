import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovedServiceTypeInJob1708839210350
  implements MigrationInterface
{
  name = 'RemovedServiceTypeInJob1708839210350';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`guard_service_id\``
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`guard_service_id\` varchar(255) NOT NULL`
    );
  }
}
