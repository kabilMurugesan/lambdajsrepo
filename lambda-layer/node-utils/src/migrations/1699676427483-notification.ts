import { MigrationInterface, QueryRunner } from 'typeorm';

export class Notification1699676427483 implements MigrationInterface {
  name = 'Notification1699676427483';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`notification\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`type\` varchar(20) NOT NULL, \`title\` varchar(50) NOT NULL, \`message\` varchar(100) NULL, \`landing_page\` varchar(50) NOT NULL COMMENT 'Landing page reference', \`landing_page_id\` varchar(255) NULL, \`status\` varchar(255) NOT NULL, \`is_read\` tinyint NOT NULL DEFAULT 0, \`response_code\` varchar(255) NULL, \`response_msg\` varchar(255) NULL, \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, UNIQUE INDEX \`REL_928b7aa1754e08e1ed7052cb9d\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_928b7aa1754e08e1ed7052cb9d8\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_928b7aa1754e08e1ed7052cb9d8\``
    );
    await queryRunner.query(
      `DROP INDEX \`REL_928b7aa1754e08e1ed7052cb9d\` ON \`notification\``
    );
    await queryRunner.query(`DROP TABLE \`notification\``);
  }
}
