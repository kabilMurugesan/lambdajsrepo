import { MigrationInterface, QueryRunner } from "typeorm";

export class addedjobcompletiondate1708872557766 implements MigrationInterface {
    name = 'addedjobcompletiondate1708872557766'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job_guards\` ADD \`job_completed_date\` timestamp NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job_guards\` DROP COLUMN \`job_completed_date\``);
    }

}
