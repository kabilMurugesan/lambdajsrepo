import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedImageInCHat1702399208507 implements MigrationInterface {
  name = 'AddedImageInCHat1702399208507';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chats\` ADD \`image\` varchar(100) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`chats\` DROP COLUMN \`image\``);
  }
}
