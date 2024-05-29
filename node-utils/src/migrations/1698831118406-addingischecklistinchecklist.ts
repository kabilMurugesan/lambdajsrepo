import { MigrationInterface, QueryRunner } from "typeorm";

export class addingischecklistinchecklist1698831118406 implements MigrationInterface {
    name = 'addingischecklistinchecklist1698831118406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`check_list\` ADD \`is_check_list_completed\` tinyint NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`check_list\` DROP COLUMN \`is_check_list_completed\``);
    }

}
