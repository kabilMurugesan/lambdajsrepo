import { MigrationInterface, QueryRunner } from "typeorm";

export class createcognitouserid1697434497057 implements MigrationInterface {
    name = 'createcognitouserid1697434497057'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`cognito_user_id\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`cognito_user_id\``);
    }

}
