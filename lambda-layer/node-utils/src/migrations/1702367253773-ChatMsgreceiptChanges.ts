import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatMsgreceiptChanges1702367253773 implements MigrationInterface {
  name = 'ChatMsgreceiptChanges1702367253773';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chat_message_recipients\` DROP COLUMN \`is_read\``
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chat_message_recipients\` ADD \`is_read\` tinyint NULL DEFAULT '0'`
    );
  }
}
