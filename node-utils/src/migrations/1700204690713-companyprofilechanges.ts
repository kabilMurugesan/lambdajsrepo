import { MigrationInterface, QueryRunner } from "typeorm";

export class companyprofilechanges1700204690713 implements MigrationInterface {
    name = 'companyprofilechanges1700204690713'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`company\` DROP FOREIGN KEY \`FK_d7b20d7c22571e893baa057406a\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP FOREIGN KEY \`FK_dd11711c017f302ee54503835d9\``);
        await queryRunner.query(`DROP INDEX \`IDX_b0fc567cf51b1cf717a9e8046a\` ON \`company\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`email\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`phone\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`address_line1\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`address_line2\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`state_id\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`city_id\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`zip_code\``);
        await queryRunner.query(`ALTER TABLE \`company\` ADD \`team_name\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD \`company_name\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD \`company_email\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD UNIQUE INDEX \`IDX_e9ae28e1148e9b2941013be338\` (\`company_email\`)`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD \`company_phone\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD \`street1\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD \`street2\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD \`country\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD \`city\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD \`company_photo_file_name\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`is_company_added\` tinyint NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`is_company_added\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`company_photo_file_name\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`city\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`country\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`street2\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`street1\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`company_phone\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP INDEX \`IDX_e9ae28e1148e9b2941013be338\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`company_email\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`company_name\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`team_name\``);
        await queryRunner.query(`ALTER TABLE \`company\` ADD \`zip_code\` varchar(10) NULL`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD \`city_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD \`state_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD \`address_line2\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD \`address_line1\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD \`phone\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD \`email\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD \`name\` varchar(100) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_b0fc567cf51b1cf717a9e8046a\` ON \`company\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD CONSTRAINT \`FK_dd11711c017f302ee54503835d9\` FOREIGN KEY (\`state_id\`) REFERENCES \`state\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD CONSTRAINT \`FK_d7b20d7c22571e893baa057406a\` FOREIGN KEY (\`city_id\`) REFERENCES \`city\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
