import { MigrationInterface, QueryRunner } from "typeorm";

export class addedguardjobinterestforiegnkey1702919198619 implements MigrationInterface {
    name = 'addedguardjobinterestforiegnkey1702919198619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guard_job_interest\` ADD \`userId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`guard_job_interest\` ADD CONSTRAINT \`FK_af01f0594afd4de0584cb8168cf\` FOREIGN KEY (\`userId\`) REFERENCES \`user_profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guard_job_interest\` DROP FOREIGN KEY \`FK_af01f0594afd4de0584cb8168cf\``);
        await queryRunner.query(`ALTER TABLE \`guard_job_interest\` DROP COLUMN \`userId\``);
    }

}
