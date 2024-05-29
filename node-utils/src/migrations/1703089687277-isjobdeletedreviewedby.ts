import { MigrationInterface, QueryRunner } from "typeorm";

export class isjobdeletedreviewedby1703089687277 implements MigrationInterface {
    name = 'isjobdeletedreviewedby1703089687277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` ADD \`is_job_deleted_by_admin\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` ADD \`rated_by\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`guard_ratings\` DROP COLUMN \`rated_by\``);
        await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`is_job_deleted_by_admin\``);
    }

}
