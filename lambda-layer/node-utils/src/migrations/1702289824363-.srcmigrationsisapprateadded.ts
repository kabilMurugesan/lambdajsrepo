import { MigrationInterface, QueryRunner } from "typeorm";

export class isapprateadded1702289824363 implements MigrationInterface {
    name = 'isapprateadded1702289824363'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`guard_ratings\` ADD \`is_app_rate\` varchar(255) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` ADD \`is_app_rate\` varchar(255) NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` DROP COLUMN \`is_app_rate\``);
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` DROP COLUMN \`is_app_rate\``);

    }

}
