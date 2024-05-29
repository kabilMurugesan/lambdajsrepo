import { MigrationInterface, QueryRunner } from "typeorm";

export class addedratedToreviewdTo1703239339739 implements MigrationInterface {
    name = 'addedratedToreviewdTo1703239339739'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` ADD \`rated_to\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` ADD \`reviewedTo\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` DROP COLUMN \`reviewedTo\``);
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` DROP COLUMN \`rated_to\``);
    }

}
