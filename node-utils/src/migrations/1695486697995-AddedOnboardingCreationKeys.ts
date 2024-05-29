import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedOnboardingCreationKeys1695486697995 implements MigrationInterface {
    name = 'AddedOnboardingCreationKeys1695486697995'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`is_profile_info_added\` tinyint NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`is_cert_verification_added\` tinyint NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`is_job_interest_added\` tinyint NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`is_job_timing_added\` tinyint NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`is_job_rate_added\` tinyint NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`is_job_rate_added\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`is_job_timing_added\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`is_job_interest_added\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`is_cert_verification_added\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`is_profile_info_added\``);
    }

}
