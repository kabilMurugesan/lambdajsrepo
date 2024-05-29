import { MigrationInterface, QueryRunner } from "typeorm";

export class addingisratedkeyinjobguards1705142698349 implements MigrationInterface {
    name = 'addingisratedkeyinjobguards1705142698349'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job_guards\` ADD \`is_guard_rating_added\` tinyint NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`job_guards\` ADD \`is_user_rating_added\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`job_guards\` CHANGE \`job_status\` \`job_status\` int NOT NULL COMMENT '0-PENDING, 1-ACCEPTED, 2-REJECTED,3-COMPLETED' DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job_guards\` CHANGE \`job_status\` \`job_status\` int NOT NULL COMMENT '0-PENDING, 1-ACCEPTED, 2-REJECTED' DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`job_guards\` DROP COLUMN \`is_user_rating_added\``);
        await queryRunner.query(`ALTER TABLE \`job_guards\` DROP COLUMN \`is_guard_rating_added\``);
    }

}
