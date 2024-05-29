import { MigrationInterface, QueryRunner } from "typeorm";

export class deleteforiegnkeyconstraint1702302453239 implements MigrationInterface {
    name = 'deleteforiegnkeyconstraint1702302453239'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` DROP FOREIGN KEY \`FK_589ad8b116b71d2a4aa156214dd\``);
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` DROP FOREIGN KEY \`FK_5810a94d9fe3f7cfe659ca32068\``);
        await queryRunner.query(`DROP INDEX \`REL_589ad8b116b71d2a4aa156214d\` ON \`guard_ratings\``);
        await queryRunner.query(`DROP INDEX \`REL_5810a94d9fe3f7cfe659ca3206\` ON \`guard_reviews\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_5810a94d9fe3f7cfe659ca3206\` ON \`guard_reviews\` (\`user_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_589ad8b116b71d2a4aa156214d\` ON \`guard_ratings\` (\`user_id\`)`);
        await queryRunner.query(`ALTER TABLE \`guard_reviews\` ADD CONSTRAINT \`FK_5810a94d9fe3f7cfe659ca32068\` FOREIGN KEY (\`user_id\`) REFERENCES \`user_profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`guard_ratings\` ADD CONSTRAINT \`FK_589ad8b116b71d2a4aa156214dd\` FOREIGN KEY (\`user_id\`) REFERENCES \`user_profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
