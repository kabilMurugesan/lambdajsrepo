import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedNewColumnsInPayments1701881476648
  implements MigrationInterface
{
  name = 'AddedNewColumnsInPayments1701881476648';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payments\` ADD \`paid_to\` varchar(255) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` ADD \`paid_account_id\` varchar(255) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payments\` DROP COLUMN \`paid_account_id\``
    );
    await queryRunner.query(`ALTER TABLE \`payments\` DROP COLUMN \`paid_to\``);
  }
}
