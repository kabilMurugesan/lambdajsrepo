import { MigrationInterface, QueryRunner } from "typeorm";

export class addingIsTeamMemberAdded1700549712266 implements MigrationInterface {
    name = 'addingIsTeamMemberAdded1700549712266'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`is_team_member_added\` tinyint NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`is_team_member_added\``);
    }

}
