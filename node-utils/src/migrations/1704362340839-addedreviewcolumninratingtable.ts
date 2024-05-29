import { MigrationInterface, QueryRunner } from "typeorm";

export class addedreviewcolumninratingtable1704362340839 implements MigrationInterface {
    name = 'addedreviewcolumninratingtable1704362340839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` ADD \`reviews\` varchar(400) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` DROP COLUMN \`reviews\``);
    }

}
