import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedInChat1702018292744 implements MigrationInterface {
  name = 'AddDeletedInChat1702018292744';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chats\` ADD \`is_deleted\` tinyint NOT NULL DEFAULT 0`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`chats\` DROP COLUMN \`is_deleted\``);
  }
}
