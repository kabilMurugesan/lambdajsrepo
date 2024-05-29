import { MigrationInterface, QueryRunner } from "typeorm";

export class isstripedetailsaddedkey1704686552809 implements MigrationInterface {
    name = 'isstripedetailsaddedkey1704686552809'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_profile\` ADD \`is_stripe_details_added\` tinyint NOT NULL DEFAULT 0`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_profile\` DROP COLUMN \`is_stripe_details_added\``);
    }

}
