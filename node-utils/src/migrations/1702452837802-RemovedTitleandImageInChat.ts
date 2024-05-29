import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovedTitleandImageInChat1702452837802
  implements MigrationInterface
{
  name = 'RemovedTitleandImageInChat1702452837802';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`chats\` DROP COLUMN \`image\``);
    await queryRunner.query(`ALTER TABLE \`chats\` DROP COLUMN \`title\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chats\` ADD \`title\` varchar(100) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`chats\` ADD \`image\` varchar(100) NULL`
    );
  }
}
