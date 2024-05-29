import { MigrationInterface, QueryRunner } from "typeorm";

export class GuardJobEntity1697729611502 implements MigrationInterface {
    name = 'GuardJobEntity1697729611502'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`job_guards\` (\`id\` varchar(36) NOT NULL, \`job_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`team_id\` varchar(255) NULL, \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`job_guards\` ADD CONSTRAINT \`FK_9fdcb0f642ee760fb758f9ef2f5\` FOREIGN KEY (\`job_id\`) REFERENCES \`job\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`job_guards\` ADD CONSTRAINT \`FK_77000e4839cd827ce69176f7581\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`job_guards\` ADD CONSTRAINT \`FK_6e7351694a67712d3f7fef4614f\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job_guards\` DROP FOREIGN KEY \`FK_6e7351694a67712d3f7fef4614f\``);
        await queryRunner.query(`ALTER TABLE \`job_guards\` DROP FOREIGN KEY \`FK_77000e4839cd827ce69176f7581\``);
        await queryRunner.query(`ALTER TABLE \`job_guards\` DROP FOREIGN KEY \`FK_9fdcb0f642ee760fb758f9ef2f5\``);
        await queryRunner.query(`DROP TABLE \`job_guards\``);
    }

}
