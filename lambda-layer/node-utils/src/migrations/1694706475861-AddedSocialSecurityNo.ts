import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedSocialSecurityNo1694706475861 implements MigrationInterface {
  name = 'AddedSocialSecurityNo1694706475861';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_profile\` ADD \`social_security_no\` varchar(9) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_profile\` DROP COLUMN \`social_security_no\``
    );
  }
}
