import { MigrationInterface, QueryRunner } from "typeorm";

export class addingJobStatus1697780297512 implements MigrationInterface {
    name = 'addingJobStatus1697780297512'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job_guards\` ADD \`job_status\` int NOT NULL COMMENT '0-PENDING, 1-ACCEPTED, 2-REJECTED' DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job_guards\` DROP COLUMN \`job_status\``);
    }

}
