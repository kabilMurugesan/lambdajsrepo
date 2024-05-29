import { MigrationInterface, QueryRunner } from "typeorm";

export class IntialCreate1695185666359 implements MigrationInterface {
    name = 'IntialCreate1695185666359'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`status\` (\`id\` varchar(36) NOT NULL, \`description\` varchar(255) NOT NULL, \`created_by\` varchar(255) NOT NULL, \`created_on\` timestamp NOT NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, \`entity_type_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`entity_type\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`sys_created_by\` varchar(255) NOT NULL, \`sys_created_on\` timestamp NOT NULL, \`sys_updated_by\` varchar(255) NULL, \`sys_updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`user_type\` varchar(255) NOT NULL COMMENT 'GUARD/CUSTOMER', \`guard_account_type\` varchar(255) NULL COMMENT 'INDIVIDUAL/TEAM', \`status\` int NOT NULL COMMENT '0-INACTIVE, 1-ACTIVE, 2-DELETED', \`otp\` varchar(255) NULL, \`otp_expiry_time\` varchar(255) NULL, \`otp_retry_count\` int NULL, \`is_email_verified\` tinyint NOT NULL DEFAULT 0, \`last_logged_in_date\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`created_by\` varchar(255) NOT NULL, \`created_on\` timestamp NOT NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, INDEX \`idx_email\` (\`email\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`city\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`state_id\` varchar(255) NOT NULL, \`status\` tinyint NOT NULL COMMENT '0-INACTIVE, 1-ACTIVE, 2-DELETED' DEFAULT '0', \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`state\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`status\` tinyint NOT NULL COMMENT '0-INACTIVE, 1-ACTIVE, 2-DELETED' DEFAULT '0', \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_profile\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`first_name\` varchar(50) NULL, \`last_name\` varchar(50) NULL, \`phone\` varchar(20) NULL, \`profile_photo_file_name\` varchar(50) NULL, \`country_code\` varchar(5) NULL, \`address_line1\` varchar(255) NULL, \`address_line2\` varchar(255) NULL, \`state_id\` varchar(255) NULL, \`city_id\` varchar(255) NULL, \`zip_code\` varchar(10) NULL, \`is_phone_verified\` tinyint NULL, \`a_post_initially_certified_date\` date NULL, \`a_post_annual_fire_arm_qualification_date\` date NULL, \`a_post_license_no\` varchar(50) NULL, \`a_post_cert_file_name\` varchar(50) NULL, \`is_a_post_cert_verified\` tinyint NULL, \`srb_license_issue_date\` date NULL, \`srb_license_expiry_date\` date NULL, \`srb_license_no\` varchar(50) NULL, \`srb_cert_file_name\` varchar(50) NULL, \`is_srb_cert_verified\` tinyint NULL, \`guard_job_rate\` decimal(4,2) NULL COMMENT 'RATE PER HOUR', \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, UNIQUE INDEX \`REL_eee360f3bff24af1b689076520\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_availability_day\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`weekday\` varchar(5) NOT NULL, \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_availability_date\` (\`id\` varchar(36) NOT NULL, \`user_availability_id\` varchar(255) NOT NULL, \`weekday\` varchar(5) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`start_time\` varchar(255) NOT NULL, \`end_time\` varchar(255) NOT NULL, \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(50) NULL, \`updated_on\` timestamp NULL, \`useravailabiltyday_id\` varchar(36) NULL, UNIQUE INDEX \`REL_d44560964cc7d254279faeb1f8\` (\`useravailabiltyday_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`guard_job_interest\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`job_interest_id\` varchar(255) NOT NULL, \`created_by\` varchar(255) NOT NULL, \`created_on\` timestamp NOT NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`job_interest\` (\`id\` varchar(36) NOT NULL, \`interest_name\` varchar(50) NOT NULL, \`description\` varchar(150) NOT NULL, \`display_order\` int NOT NULL, \`interest_type\` tinyint NOT NULL COMMENT '1-How Long?, 2-Service Type', \`status\` tinyint NOT NULL COMMENT '0-INACTIVE, 1-ACTIVE, 2-DELETED' DEFAULT '0', \`created_by\` varchar(255) NOT NULL, \`created_on\` timestamp NOT NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`company\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`email\` varchar(255) NOT NULL, \`phone\` varchar(20) NULL, \`address_line1\` varchar(255) NOT NULL, \`address_line2\` varchar(255) NULL, \`state_id\` varchar(255) NULL, \`city_id\` varchar(255) NULL, \`zip_code\` varchar(10) NULL, \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, UNIQUE INDEX \`IDX_b0fc567cf51b1cf717a9e8046a\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`team\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`company_id\` varchar(255) NOT NULL, \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`team_members\` (\`id\` varchar(36) NOT NULL, \`team_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`is_lead\` tinyint NOT NULL DEFAULT 0, \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`status\` ADD CONSTRAINT \`FK_0f5c75c6a7387d688addbcd6f6d\` FOREIGN KEY (\`entity_type_id\`) REFERENCES \`entity_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`city\` ADD CONSTRAINT \`FK_37ecd8addf395545dcb0242a593\` FOREIGN KEY (\`state_id\`) REFERENCES \`state\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD CONSTRAINT \`FK_eee360f3bff24af1b6890765201\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD CONSTRAINT \`FK_ef81a12b3d9ead50fc569c86db6\` FOREIGN KEY (\`state_id\`) REFERENCES \`state\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD CONSTRAINT \`FK_d76c0fe745a52ea865373dcdcea\` FOREIGN KEY (\`city_id\`) REFERENCES \`city\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_availability_day\` ADD CONSTRAINT \`FK_be73fa80527ce154a26cbd4fc7e\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_availability_date\` ADD CONSTRAINT \`FK_d44560964cc7d254279faeb1f80\` FOREIGN KEY (\`useravailabiltyday_id\`) REFERENCES \`user_availability_day\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_availability_date\` ADD CONSTRAINT \`FK_de1828044378b0f2b400c7f9cf2\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`guard_job_interest\` ADD CONSTRAINT \`FK_892aad48f0c6348f97ec26ffef6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`guard_job_interest\` ADD CONSTRAINT \`FK_8260b01d53b295310eb3c8e87d9\` FOREIGN KEY (\`job_interest_id\`) REFERENCES \`job_interest\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD CONSTRAINT \`FK_dd11711c017f302ee54503835d9\` FOREIGN KEY (\`state_id\`) REFERENCES \`state\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`company\` ADD CONSTRAINT \`FK_d7b20d7c22571e893baa057406a\` FOREIGN KEY (\`city_id\`) REFERENCES \`city\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`team\` ADD CONSTRAINT \`FK_b36ca3769370f1fe4f5519e85f9\` FOREIGN KEY (\`company_id\`) REFERENCES \`company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`team_members\` ADD CONSTRAINT \`FK_fdad7d5768277e60c40e01cdcea\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`team_members\` ADD CONSTRAINT \`FK_c2bf4967c8c2a6b845dadfbf3d4\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`team_members\` DROP FOREIGN KEY \`FK_c2bf4967c8c2a6b845dadfbf3d4\``);
        await queryRunner.query(`ALTER TABLE \`team_members\` DROP FOREIGN KEY \`FK_fdad7d5768277e60c40e01cdcea\``);
        await queryRunner.query(`ALTER TABLE \`team\` DROP FOREIGN KEY \`FK_b36ca3769370f1fe4f5519e85f9\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP FOREIGN KEY \`FK_d7b20d7c22571e893baa057406a\``);
        await queryRunner.query(`ALTER TABLE \`company\` DROP FOREIGN KEY \`FK_dd11711c017f302ee54503835d9\``);
        await queryRunner.query(`ALTER TABLE \`guard_job_interest\` DROP FOREIGN KEY \`FK_8260b01d53b295310eb3c8e87d9\``);
        await queryRunner.query(`ALTER TABLE \`guard_job_interest\` DROP FOREIGN KEY \`FK_892aad48f0c6348f97ec26ffef6\``);
        await queryRunner.query(`ALTER TABLE \`user_availability_date\` DROP FOREIGN KEY \`FK_de1828044378b0f2b400c7f9cf2\``);
        await queryRunner.query(`ALTER TABLE \`user_availability_date\` DROP FOREIGN KEY \`FK_d44560964cc7d254279faeb1f80\``);
        await queryRunner.query(`ALTER TABLE \`user_availability_day\` DROP FOREIGN KEY \`FK_be73fa80527ce154a26cbd4fc7e\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP FOREIGN KEY \`FK_d76c0fe745a52ea865373dcdcea\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP FOREIGN KEY \`FK_ef81a12b3d9ead50fc569c86db6\``);
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP FOREIGN KEY \`FK_eee360f3bff24af1b6890765201\``);
        await queryRunner.query(`ALTER TABLE \`city\` DROP FOREIGN KEY \`FK_37ecd8addf395545dcb0242a593\``);
        await queryRunner.query(`ALTER TABLE \`status\` DROP FOREIGN KEY \`FK_0f5c75c6a7387d688addbcd6f6d\``);
        await queryRunner.query(`DROP TABLE \`team_members\``);
        await queryRunner.query(`DROP TABLE \`team\``);
        await queryRunner.query(`DROP INDEX \`IDX_b0fc567cf51b1cf717a9e8046a\` ON \`company\``);
        await queryRunner.query(`DROP TABLE \`company\``);
        await queryRunner.query(`DROP TABLE \`job_interest\``);
        await queryRunner.query(`DROP TABLE \`guard_job_interest\``);
        await queryRunner.query(`DROP INDEX \`REL_d44560964cc7d254279faeb1f8\` ON \`user_availability_date\``);
        await queryRunner.query(`DROP TABLE \`user_availability_date\``);
        await queryRunner.query(`DROP TABLE \`user_availability_day\``);
        await queryRunner.query(`DROP INDEX \`REL_eee360f3bff24af1b689076520\` ON \`user_profile\``);
        await queryRunner.query(`DROP TABLE \`user_profile\``);
        await queryRunner.query(`DROP TABLE \`state\``);
        await queryRunner.query(`DROP TABLE \`city\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`idx_email\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`entity_type\``);
        await queryRunner.query(`DROP TABLE \`status\``);
    }

}
