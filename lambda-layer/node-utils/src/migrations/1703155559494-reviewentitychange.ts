import { MigrationInterface, QueryRunner } from "typeorm";

export class reviewentitychange1703155559494 implements MigrationInterface {
    name = 'reviewentitychange1703155559494'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job_guards\` DROP FOREIGN KEY \`FK_9fdcb0f642ee760fb758f9ef2f5\``);
        await queryRunner.query(`ALTER TABLE \`job_guards\` ADD \`jobId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` ADD \`reviewed_by\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`job_guards\` ADD CONSTRAINT \`FK_32499bc4b8d5a905c2bd7af25cc\` FOREIGN KEY (\`jobId\`) REFERENCES \`job\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job_guards\` DROP FOREIGN KEY \`FK_32499bc4b8d5a905c2bd7af25cc\``);
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` DROP COLUMN \`reviewed_by\``);
        await queryRunner.query(`ALTER TABLE \`job_guards\` DROP COLUMN \`jobId\``);
        await queryRunner.query(`ALTER TABLE \`job_guards\` ADD CONSTRAINT \`FK_9fdcb0f642ee760fb758f9ef2f5\` FOREIGN KEY (\`job_id\`) REFERENCES \`job\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
