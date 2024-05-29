import { MigrationInterface, QueryRunner } from "typeorm";

export class addingsrbstateinuserprofile1699975853692 implements MigrationInterface {
    name = 'addingsrbstateinuserprofile1699975853692'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`srb_state_id\` varchar(70) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`srb_state_id\``);
    }

}
