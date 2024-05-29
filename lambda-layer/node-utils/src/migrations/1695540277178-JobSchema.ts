import { MigrationInterface, QueryRunner } from "typeorm";

export class JobSchema1695540277178 implements MigrationInterface {
    name = 'JobSchema1695540277178'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`job\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`job_name\` varchar(255) NOT NULL, \`guard_coverage_id\` varchar(255) NOT NULL, \`guard_service_id\` varchar(255) NOT NULL, \`no_of_guards\` int NOT NULL, \`start_date\` timestamp NOT NULL, \`end_date\` timestamp NOT NULL, \`job_venue\` varchar(255) NULL, \`job_venue_location_coordinates\` varchar(255) NOT NULL, \`job_venue_radius\` varchar(255) NOT NULL, \`created_by\` varchar(255) NOT NULL, \`created_on\` timestamp NOT NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`job\` ADD CONSTRAINT \`FK_13dd4ad96c9a725eadf48db7558\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` DROP FOREIGN KEY \`FK_13dd4ad96c9a725eadf48db7558\``);
        await queryRunner.query(`DROP TABLE \`job\``);
    }

}
