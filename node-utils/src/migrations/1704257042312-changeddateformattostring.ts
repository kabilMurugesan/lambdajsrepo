import { MigrationInterface, QueryRunner } from "typeorm";

export class changeddateformattostring1704257042312 implements MigrationInterface {
    name = 'changeddateformattostring1704257042312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`a_post_initially_certified_date\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`a_post_initially_certified_date\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`a_post_annual_fire_arm_qualification_date\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`a_post_annual_fire_arm_qualification_date\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`srb_license_issue_date\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`srb_license_issue_date\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`srb_license_expiry_date\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`srb_license_expiry_date\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`srb_license_expiry_date\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`srb_license_expiry_date\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`srb_license_issue_date\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`srb_license_issue_date\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`a_post_annual_fire_arm_qualification_date\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`a_post_annual_fire_arm_qualification_date\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`a_post_initially_certified_date\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`a_post_initially_certified_date\` date NULL`);
    }

}
