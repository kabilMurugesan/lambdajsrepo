import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedJobInEntity1702009737511 implements MigrationInterface {
  name = 'AddedJobInEntity1702009737511';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chats\` ADD \`job_id\` varchar(255) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`chats\` ADD CONSTRAINT \`FK_da481a11d43e698c2c49dcddb68\` FOREIGN KEY (\`job_id\`) REFERENCES \`job\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chats\` DROP FOREIGN KEY \`FK_da481a11d43e698c2c49dcddb68\``
    );
    await queryRunner.query(`ALTER TABLE \`chats\` DROP COLUMN \`job_id\``);
  }
}
