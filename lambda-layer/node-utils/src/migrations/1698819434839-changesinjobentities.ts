import { MigrationInterface, QueryRunner } from "typeorm";

export class changesinjobentities1698819434839 implements MigrationInterface {
    name = 'changesinjobentities1698819434839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` ADD \`is_job_created\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`job\` ADD \`is_guard_added\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`is_guard_added\``);
        await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`is_job_created\``);
    }

}
