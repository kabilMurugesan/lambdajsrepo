import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovedChatType1704995422848 implements MigrationInterface {
  name = 'RemovedChatType1704995422848';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`chats\` DROP COLUMN \`chat_type\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chats\` ADD \`chat_type\` varchar(255) NOT NULL COMMENT 'single/group' DEFAULT 'single'`
    );
  }
}
