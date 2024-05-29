import { MigrationInterface, QueryRunner } from "typeorm";

export class recurrencejobcreation1699601978669 implements MigrationInterface {
    name = 'recurrencejobcreation1699601978669'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`job_day\` (\`id\` varchar(36) NOT NULL, \`job_id\` varchar(255) NOT NULL, \`start_time\` varchar(255) NOT NULL, \`end_time\` varchar(255) NOT NULL, \`day\` varchar(255) NOT NULL, \`created_by\` varchar(255) NOT NULL, \`created_on\` timestamp NOT NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`job_day\` ADD CONSTRAINT \`FK_5e11f2fd5f5940ff680da1a91ef\` FOREIGN KEY (\`job_id\`) REFERENCES \`job\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job_day\` DROP FOREIGN KEY \`FK_5e11f2fd5f5940ff680da1a91ef\``);
        await queryRunner.query(`DROP TABLE \`job_day\``);
    }

}
