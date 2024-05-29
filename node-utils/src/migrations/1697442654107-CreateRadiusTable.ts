import { MigrationInterface, QueryRunner } from "typeorm";

export class createRadiusTable1697442654107 implements MigrationInterface {
    name = 'createRadiusTable1697442654107'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`radius\` (\`id\` varchar(36) NOT NULL, \`radius\` varchar(255) NOT NULL, \`created_by\` varchar(255) NOT NULL, \`created_on\` timestamp NOT NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`radius\``);
    }

}
