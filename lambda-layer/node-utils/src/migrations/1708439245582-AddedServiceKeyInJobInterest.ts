import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedServiceKeyInJobInterest1708439245582
  implements MigrationInterface
{
  name = 'AddedServiceKeyInJobInterest1708439245582';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`guard_security_service_id\` varchar(255) NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`guard_security_service_id\``
    );
  }
}
