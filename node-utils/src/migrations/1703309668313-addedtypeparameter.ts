import { MigrationInterface, QueryRunner } from "typeorm";

export class addedtypeparameter1703309668313 implements MigrationInterface {
    name = 'addedtypeparameter1703309668313'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` ADD \`type\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` ADD \`type\` varchar(100) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` DROP COLUMN \`type\``)
    }
}