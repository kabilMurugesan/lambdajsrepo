import { MigrationInterface, QueryRunner } from "typeorm";

export class settingpage1701689999752 implements MigrationInterface {
    name = 'settingpage1701689999752'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`settings\` (\`id\` varchar(36) NOT NULL, \`value\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`created_by\` varchar(255) NOT NULL, \`created_on\` timestamp NOT NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`settings\``);
    }

}
