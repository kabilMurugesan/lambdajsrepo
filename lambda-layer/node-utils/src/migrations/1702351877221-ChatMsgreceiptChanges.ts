import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatMsgreceiptChanges1702351877221 implements MigrationInterface {
  name = 'ChatMsgreceiptChanges1702351877221';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chat_message_recipients\` DROP COLUMN \`message\``
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chat_message_recipients\` ADD \`message\` varchar(255) NOT NULL`
    );
  }
}
