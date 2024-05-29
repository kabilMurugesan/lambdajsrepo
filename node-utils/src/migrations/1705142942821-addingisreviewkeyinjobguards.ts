import { MigrationInterface, QueryRunner } from "typeorm";

export class addingisreviewkeyinjobguards1705142942821 implements MigrationInterface {
    name = 'addingisreviewkeyinjobguards1705142942821'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job_guards\` ADD \`is_guard_review_added\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`job_guards\` ADD \`is_user_review_added\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`job_guards\` CHANGE \`is_guard_rating_added\` \`is_guard_rating_added\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`job_guards\` ADD CONSTRAINT \`FK_9fdcb0f642ee760fb758f9ef2f5\` FOREIGN KEY (\`job_id\`) REFERENCES \`job\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job_guards\` CHANGE \`is_guard_rating_added\` \`is_guard_rating_added\` tinyint NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`job_guards\` DROP COLUMN \`is_user_review_added\``);
        await queryRunner.query(`ALTER TABLE \`job_guards\` DROP COLUMN \`is_guard_review_added\``);
        await queryRunner.query(`ALTER TABLE \`job_guards\` ADD CONSTRAINT \`FK_32499bc4b8d5a905c2bd7af25cc\` FOREIGN KEY (\`jobId\`) REFERENCES \`job\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
