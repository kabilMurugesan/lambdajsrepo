import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatEntities1701946040900 implements MigrationInterface {
  name = 'ChatEntities1701946040900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`chats\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(100) NULL, \`image\` varchar(100) NULL, \`chat_type\` varchar(255) NOT NULL COMMENT 'single/group' DEFAULT 'single', \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`chat_participants\` (\`id\` varchar(36) NOT NULL, \`chat_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`chat_messages\` (\`id\` varchar(36) NOT NULL, \`chat_id\` varchar(255) NOT NULL, \`message\` varchar(255) NOT NULL, \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`chat_message_recipients\` (\`id\` varchar(36) NOT NULL, \`chat_message_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`message\` varchar(255) NOT NULL, \`is_read\` tinyint NULL DEFAULT 0, \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_participants\` ADD CONSTRAINT \`FK_b4129b3e21906ca57b503a1d834\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_participants\` ADD CONSTRAINT \`FK_9946d299e9ccfbee23aa40c5545\` FOREIGN KEY (\`chat_id\`) REFERENCES \`chats\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_messages\` ADD CONSTRAINT \`FK_9f5c0b96255734666b7b4bc98c3\` FOREIGN KEY (\`chat_id\`) REFERENCES \`chats\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_message_recipients\` ADD CONSTRAINT \`FK_91d495aac60a0b6d08ef17ce33a\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_message_recipients\` ADD CONSTRAINT \`FK_d4780f61016e1e1c14955d47b5a\` FOREIGN KEY (\`chat_message_id\`) REFERENCES \`chat_messages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chat_message_recipients\` DROP FOREIGN KEY \`FK_d4780f61016e1e1c14955d47b5a\``
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_message_recipients\` DROP FOREIGN KEY \`FK_91d495aac60a0b6d08ef17ce33a\``
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_messages\` DROP FOREIGN KEY \`FK_9f5c0b96255734666b7b4bc98c3\``
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_participants\` DROP FOREIGN KEY \`FK_9946d299e9ccfbee23aa40c5545\``
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_participants\` DROP FOREIGN KEY \`FK_b4129b3e21906ca57b503a1d834\``
    );
    await queryRunner.query(`DROP TABLE \`chat_message_recipients\``);
    await queryRunner.query(`DROP TABLE \`chat_messages\``);
    await queryRunner.query(`DROP TABLE \`chat_participants\``);
    await queryRunner.query(`DROP TABLE \`chats\``);
  }
}
