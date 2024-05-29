import { MigrationInterface, QueryRunner } from "typeorm";

export class addedguardnameinratings1707474329217 implements MigrationInterface {
    name = 'addedguardnameinratings1707474329217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` ADD \`app_rated\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` ADD \`customer_name\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` ADD \`guard_name\` varchar(100) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` DROP COLUMN \`guard_name\``);
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` DROP COLUMN \`customer_name\``);
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` DROP COLUMN \`app_rated\``);
    }

}
