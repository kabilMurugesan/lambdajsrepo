import { MigrationInterface, QueryRunner } from "typeorm";

export class addedmissingkeys1702431811145 implements MigrationInterface {
    name = 'addedmissingkeys1702431811145'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`REL_8404253f3fe8c25cb54432cdee\` ON \`guard_reviews\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`is_app_rating_added\` tinyint NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`is_app_review_added\` tinyint NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`job\` ADD \`time_zone_name\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`job_guard_coordinates\` ADD \`is_guard_with_in_radius\` varchar(255) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`is_certificate_verified\` \`is_certificate_verified\` int NOT NULL COMMENT '0-INPROGRESS, 1-ACCEPTED, 2-REJECTED' DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`check_list\` DROP COLUMN \`is_check_list_completed\``);
        await queryRunner.query(`ALTER TABLE \`check_list\` ADD \`is_check_list_completed\` int NOT NULL COMMENT '0-PENDING, 1-INPROGRESS, 2-COMPLETED' DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_928b7aa1754e08e1ed7052cb9d8\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_stripe_accounts\` ADD CONSTRAINT \`FK_7adb4e1700b5a0fb927ae0942ab\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_stripe_accounts\` DROP FOREIGN KEY \`FK_7adb4e1700b5a0fb927ae0942ab\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_928b7aa1754e08e1ed7052cb9d8\``);
        await queryRunner.query(`ALTER TABLE \`check_list\` DROP COLUMN \`is_check_list_completed\``);
        await queryRunner.query(`ALTER TABLE \`check_list\` ADD \`is_check_list_completed\` tinyint NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`is_certificate_verified\` \`is_certificate_verified\` int NOT NULL COMMENT '0-INACTIVE, 1-ACCEPTED, 2-REJECTED' DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`job_guard_coordinates\` DROP COLUMN \`is_guard_with_in_radius\``);
        await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`time_zone_name\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`is_app_review_added\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`is_app_rating_added\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_8404253f3fe8c25cb54432cdee\` ON \`guard_reviews\` (\`job_id\`)`);
    }

}
