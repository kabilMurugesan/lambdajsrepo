import { MigrationInterface, QueryRunner } from 'typeorm';

export class JobIdNullable1702471157765 implements MigrationInterface {
  name = 'JobIdNullable1702471157765';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chats\` DROP FOREIGN KEY \`FK_da481a11d43e698c2c49dcddb68\``
    );
    await queryRunner.query(
      `ALTER TABLE \`chats\` CHANGE \`job_id\` \`job_id\` varchar(255) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`chats\` ADD CONSTRAINT \`FK_da481a11d43e698c2c49dcddb68\` FOREIGN KEY (\`job_id\`) REFERENCES \`job\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chats\` DROP FOREIGN KEY \`FK_da481a11d43e698c2c49dcddb68\``
    );
    await queryRunner.query(
      `ALTER TABLE \`chats\` CHANGE \`job_id\` \`job_id\` varchar(255) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`chats\` ADD CONSTRAINT \`FK_da481a11d43e698c2c49dcddb68\` FOREIGN KEY (\`job_id\`) REFERENCES \`job\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
