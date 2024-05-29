import { MigrationInterface, QueryRunner } from "typeorm";

export class changingemailverifieddatatypeinusertable1698658013432 implements MigrationInterface {
    name = 'changingemailverifieddatatypeinusertable1698658013432'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`is_certificate_verified\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`is_certificate_verified\` int NOT NULL COMMENT '0-INACTIVE, 1-ACCEPTED, 2-REJECTED' DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`is_certificate_verified\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`is_certificate_verified\` tinyint NOT NULL DEFAULT '0'`);
    }

}
