import { MigrationInterface, QueryRunner } from "typeorm";

export class createforiegnkeyconstraint1701276114986 implements MigrationInterface {
    name = 'createforiegnkeyconstraint1701276114986'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`guard_ratings\` (\`id\` varchar(36) NOT NULL, \`ratings\` varchar(100) NOT NULL, \`user_id\` varchar(100) NOT NULL, \`guard_id\` varchar(255) NOT NULL, \`job_id\` varchar(255) NOT NULL, \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, UNIQUE INDEX \`REL_589ad8b116b71d2a4aa156214d\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`guard_reviews\` (\`id\` varchar(36) NOT NULL, \`reviews\` varchar(400) NOT NULL, \`user_id\` varchar(100) NOT NULL, \`guard_id\` varchar(255) NOT NULL, \`job_id\` varchar(255) NOT NULL, \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, UNIQUE INDEX \`REL_5810a94d9fe3f7cfe659ca3206\` (\`user_id\`), UNIQUE INDEX \`REL_8404253f3fe8c25cb54432cdee\` (\`job_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` ADD CONSTRAINT \`FK_589ad8b116b71d2a4aa156214dd\` FOREIGN KEY (\`user_id\`) REFERENCES \`user_profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` ADD CONSTRAINT \`FK_5810a94d9fe3f7cfe659ca32068\` FOREIGN KEY (\`user_id\`) REFERENCES \`user_profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` ADD CONSTRAINT \`FK_8404253f3fe8c25cb54432cdeec\` FOREIGN KEY (\`job_id\`) REFERENCES \`guard_ratings\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` DROP FOREIGN KEY \`FK_8404253f3fe8c25cb54432cdeec\``);
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` DROP FOREIGN KEY \`FK_5810a94d9fe3f7cfe659ca32068\``);
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` DROP FOREIGN KEY \`FK_589ad8b116b71d2a4aa156214dd\``);
        await queryRunner.query(`DROP INDEX \`REL_8404253f3fe8c25cb54432cdee\` ON \`guard_reviews\``);
        await queryRunner.query(`DROP INDEX \`REL_5810a94d9fe3f7cfe659ca3206\` ON \`guard_reviews\``);
        await queryRunner.query(`DROP TABLE \`guard_reviews\``);
        await queryRunner.query(`DROP INDEX \`REL_589ad8b116b71d2a4aa156214d\` ON \`guard_ratings\``);
        await queryRunner.query(`DROP TABLE \`guard_ratings\``);
    }

}
