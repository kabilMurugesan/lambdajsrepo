import { MigrationInterface, QueryRunner } from 'typeorm';

export class SocketConnectionUpdate1702295385228 implements MigrationInterface {
  name = 'SocketConnectionUpdate1702295385228';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`socket_connections\` DROP COLUMN \`message\``
    );
    await queryRunner.query(
      `ALTER TABLE \`socket_connections\` DROP COLUMN \`message_id\``
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`socket_connections\` ADD \`message_id\` varchar(255) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`socket_connections\` ADD \`message\` varchar(255) NULL`
    );
  }
}
