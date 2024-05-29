import { MigrationInterface, QueryRunner } from 'typeorm';

export class JobIdInJobEntity1701751082658 implements MigrationInterface {
  name = 'JobIdInJobEntity1701751082658';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`job_ref_id\` int NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`job_ref_id\``);
  }
}
