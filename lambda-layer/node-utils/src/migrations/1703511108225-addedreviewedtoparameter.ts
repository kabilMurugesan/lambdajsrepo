import { MigrationInterface, QueryRunner } from "typeorm";

export class addedreviewedtoparameter1703511108225 implements MigrationInterface {
    name = 'addedreviewedtoparameter1703511108225'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` CHANGE \`reviewedTo\` \`reviewed_to\` varchar(255) NOT NULL`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`guard_reviews\` CHANGE \`reviewed_to\` \`reviewedTo\` varchar(255) NOT NULL`);
    }

}
