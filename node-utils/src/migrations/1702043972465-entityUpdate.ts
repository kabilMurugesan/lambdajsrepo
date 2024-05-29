import { MigrationInterface, QueryRunner } from 'typeorm';

export class EntityUpdate1702043972465 implements MigrationInterface {
  name = 'EntityUpdate1702043972465';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chat_participants\` DROP FOREIGN KEY \`FK_b4129b3e21906ca57b503a1d834\``
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_message_recipients\` DROP FOREIGN KEY \`FK_91d495aac60a0b6d08ef17ce33a\``
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_participants\` ADD CONSTRAINT \`FK_b4129b3e21906ca57b503a1d834\` FOREIGN KEY (\`user_id\`) REFERENCES \`user_profile\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_messages\` ADD CONSTRAINT \`FK_88fa796934ff9c60cf74cb1419e\` FOREIGN KEY (\`created_by\`) REFERENCES \`user_profile\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_message_recipients\` ADD CONSTRAINT \`FK_91d495aac60a0b6d08ef17ce33a\` FOREIGN KEY (\`user_id\`) REFERENCES \`user_profile\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chat_message_recipients\` DROP FOREIGN KEY \`FK_91d495aac60a0b6d08ef17ce33a\``
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_messages\` DROP FOREIGN KEY \`FK_88fa796934ff9c60cf74cb1419e\``
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_participants\` DROP FOREIGN KEY \`FK_b4129b3e21906ca57b503a1d834\``
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_message_recipients\` ADD CONSTRAINT \`FK_91d495aac60a0b6d08ef17ce33a\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_participants\` ADD CONSTRAINT \`FK_b4129b3e21906ca57b503a1d834\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
