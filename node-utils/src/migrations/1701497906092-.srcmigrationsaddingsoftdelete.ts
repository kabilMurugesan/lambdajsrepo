import { MigrationInterface, QueryRunner } from "typeorm";

export class addingsoftdelete1701497906092 implements MigrationInterface {
    name = 'addingsoftdelete1701497906092'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` ADD \`is_deleted\` tinyint NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` ADD \`is_deleted\` tinyint NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` DROP COLUMN \`is_deleted\``);
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` DROP COLUMN \`is_deleted\``);
    }

}
