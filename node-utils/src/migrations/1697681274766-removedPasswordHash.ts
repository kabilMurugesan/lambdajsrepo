import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedPasswordHash1697681274766 implements MigrationInterface {
    name = 'RemovedPasswordHash1697681274766'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`password_hash\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`password_hash\` varchar(255) NOT NULL`);
    }

}
