import { MigrationInterface, QueryRunner } from "typeorm";

export class FavouriteGuard1704175581460 implements MigrationInterface {
    name = 'FavouriteGuard1704175581460'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`CREATE TABLE \`favorite_guard\` (\`id\` varchar(36) NOT NULL, \`guard_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`is_favorite\` tinyint NOT NULL DEFAULT 1, \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`favorite_guard\` ADD CONSTRAINT \`FK_915ded945fb1bc49c7610991478\` FOREIGN KEY (\`user_id\`) REFERENCES \`user_profile\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`favorite_guard\` DROP FOREIGN KEY \`FK_915ded945fb1bc49c7610991478\``);
        await queryRunner.query(`DROP TABLE \`favorite_guard\``);
    }

}
