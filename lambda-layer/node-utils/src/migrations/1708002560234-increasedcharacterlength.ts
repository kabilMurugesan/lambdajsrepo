import { MigrationInterface, QueryRunner } from "typeorm";

export class increasedcharacterlength1708002560234 implements MigrationInterface {
    name = 'increasedcharacterlength1708002560234'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`notification\` DROP COLUMN \`message\``);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD \`message\` varchar(150) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`notification\` DROP COLUMN \`message\``);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD \`message\` varchar(100) NULL`);
    }

}
