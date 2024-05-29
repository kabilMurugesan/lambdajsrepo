import { MigrationInterface, QueryRunner } from "typeorm";

export class changingcompanyemailtonullabletrue1700806726898 implements MigrationInterface {
    name = 'changingcompanyemailtonullabletrue1700806726898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_e9ae28e1148e9b2941013be338\` ON \`company\``);
        await queryRunner.query(`ALTER TABLE \`company\` CHANGE \`company_email\` \`company_email\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`company\` CHANGE \`company_email\` \`company_email\` varchar(255) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_e9ae28e1148e9b2941013be338\` ON \`company\` (\`company_email\`)`);
    }

}
