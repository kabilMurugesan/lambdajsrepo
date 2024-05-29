import { MigrationInterface, QueryRunner } from "typeorm";

export class changingcertificatecolumntype1697627361176 implements MigrationInterface {
    name = 'changingcertificatecolumntype1697627361176'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`is_a_post_cert_verified\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`is_a_post_cert_verified\` int NOT NULL COMMENT '0-INACTIVE, 1-ACCEPTED, 2-REJECTED' DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`is_srb_cert_verified\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`is_srb_cert_verified\` int NOT NULL COMMENT '0-INACTIVE, 1-ACCEPTED, 2-REJECTED' DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`is_srb_cert_verified\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`is_srb_cert_verified\` tinyint NULL`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`is_a_post_cert_verified\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`is_a_post_cert_verified\` tinyint NULL`);
    }

}
