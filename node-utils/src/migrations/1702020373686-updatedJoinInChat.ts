import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatedJoinInChat1702020373686 implements MigrationInterface {
  name = 'UpdatedJoinInChat1702020373686';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chats\` DROP FOREIGN KEY \`FK_d3d5c049f59f0f7266900e6adc1\``
    );
    await queryRunner.query(
      `ALTER TABLE \`chats\` ADD CONSTRAINT \`FK_d3d5c049f59f0f7266900e6adc1\` FOREIGN KEY (\`created_by\`) REFERENCES \`user_profile\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chats\` DROP FOREIGN KEY \`FK_d3d5c049f59f0f7266900e6adc1\``
    );
    await queryRunner.query(
      `ALTER TABLE \`chats\` ADD CONSTRAINT \`FK_d3d5c049f59f0f7266900e6adc1\` FOREIGN KEY (\`created_by\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
