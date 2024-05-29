import { MigrationInterface, QueryRunner } from 'typeorm';

export class SocketConnection1702278589572 implements MigrationInterface {
  name = 'SocketConnection1702278589572';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`socket_connections\` (\`id\` varchar(36) NOT NULL, \`chat_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`connection_id\` varchar(255) NOT NULL, \`source_ip_address\` varchar(255) NULL, \`message_id\` varchar(255) NULL, \`message\` varchar(255) NULL, \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`socket_connections\` ADD CONSTRAINT \`FK_10b14ccb1706071ce8907986caa\` FOREIGN KEY (\`chat_id\`) REFERENCES \`chats\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`socket_connections\` DROP FOREIGN KEY \`FK_10b14ccb1706071ce8907986caa\``
    );
    await queryRunner.query(`DROP TABLE \`socket_connections\``);
  }
}
