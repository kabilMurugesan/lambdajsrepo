import { MigrationInterface, QueryRunner } from "typeorm";

export class createchecklist1696500915883 implements MigrationInterface {
    name = 'createchecklist1696500915883'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`check_list\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`date\` varchar(255) NOT NULL, \`time\` timestamp NOT NULL, \`description\` varchar(255) NOT NULL, \`job_id\` varchar(255) NOT NULL, \`created_on\` timestamp NOT NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`check_list\``);
    }

}
