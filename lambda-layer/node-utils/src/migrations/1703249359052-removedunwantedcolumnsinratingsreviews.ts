import { MigrationInterface, QueryRunner } from "typeorm";

export class removedunwantedcolumnsinratingsreviews1703249359052 implements MigrationInterface {
    name = 'removedunwantedcolumnsinratingsreviews1703249359052'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` DROP COLUMN \`guard_id\``);
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` DROP COLUMN \`guard_id\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` ADD \`guard_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` ADD \`user_id\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` ADD \`guard_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` ADD \`user_id\` varchar(100) NOT NULL`);
    }

}
