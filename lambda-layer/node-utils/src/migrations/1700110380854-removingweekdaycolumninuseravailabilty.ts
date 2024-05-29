import { MigrationInterface, QueryRunner } from "typeorm";

export class removingweekdaycolumninuseravailabilty1700110380854 implements MigrationInterface {
    name = 'removingweekdaycolumninuseravailabilty1700110380854'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_availability_date\` DROP COLUMN \`weekday\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_availability_date\` ADD \`weekday\` varchar(5) NOT NULL`);
    }

}
