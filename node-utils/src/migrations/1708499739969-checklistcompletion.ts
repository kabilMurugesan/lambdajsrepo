import { MigrationInterface, QueryRunner } from "typeorm";

export class checklistcompletion1708499739969 implements MigrationInterface {
    name = 'checklistcompletion1708499739969'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`CREATE TABLE \`completed_check_list\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`check_list_id\` varchar(255) NOT NULL, \`created_on\` timestamp NOT NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`completed_check_list\``);
    }

}
