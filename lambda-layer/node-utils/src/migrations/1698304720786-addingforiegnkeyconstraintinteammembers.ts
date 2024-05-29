import { MigrationInterface, QueryRunner } from "typeorm";

export class addingforiegnkeyconstraintinteammembers1698304720786 implements MigrationInterface {
    name = 'addingforiegnkeyconstraintinteammembers1698304720786'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`team_members\` DROP FOREIGN KEY \`FK_c2bf4967c8c2a6b845dadfbf3d4\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_eee360f3bff24af1b689076520\` ON \`user_profile\` (\`user_id\`)`);
        await queryRunner.query(`ALTER TABLE \`team_members\` ADD CONSTRAINT \`FK_c2bf4967c8c2a6b845dadfbf3d4\` FOREIGN KEY (\`user_id\`) REFERENCES \`user_profile\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`team_members\` DROP FOREIGN KEY \`FK_c2bf4967c8c2a6b845dadfbf3d4\``);
        await queryRunner.query(`DROP INDEX \`IDX_eee360f3bff24af1b689076520\` ON \`user_profile\``);
        await queryRunner.query(`ALTER TABLE \`team_members\` ADD CONSTRAINT \`FK_c2bf4967c8c2a6b845dadfbf3d4\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
