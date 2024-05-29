import { MigrationInterface, QueryRunner } from "typeorm";

export class addingsuccessinfokey1701063605154 implements MigrationInterface {
    name = 'addingsuccessinfokey1701063605154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`is_success_info_added\` tinyint NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`is_success_info_added\``);
    }

}
