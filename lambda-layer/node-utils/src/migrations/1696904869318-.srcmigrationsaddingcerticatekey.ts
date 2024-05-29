import { MigrationInterface, QueryRunner } from "typeorm";

export class addingcerticatekey1696904869318 implements MigrationInterface {
    name = 'addingcerticatekey1696904869318'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`is_certificate_verified\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`is_certificate_verified\``);
    }

}
