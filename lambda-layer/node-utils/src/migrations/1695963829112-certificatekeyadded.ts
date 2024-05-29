import { MigrationInterface, QueryRunner } from "typeorm";

export class Certificatekeyadded1695963829112 implements MigrationInterface {
    name = 'Certificatekeyadded1695963829112'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`is_apost_added\` tinyint NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`is_asrb_added\` tinyint NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` CHANGE \`guard_job_rate\` \`guard_job_rate\` decimal(10,2) NULL COMMENT 'RATE PER HOUR'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_profile\` CHANGE \`guard_job_rate\` \`guard_job_rate\` decimal(4,2) NULL COMMENT 'RATE PER HOUR'`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`is_asrb_added\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`is_apost_added\``);
    }

}
