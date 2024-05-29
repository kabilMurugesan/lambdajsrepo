import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovedImageInChat1702131797028 implements MigrationInterface {
  name = 'RemovedImageInChat1702131797028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`chats\` DROP COLUMN \`image\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chats\` ADD \`image\` varchar(100) NULL`
    );
  }
}
