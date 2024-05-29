import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUniqueKeyInNotification1699940750262
  implements MigrationInterface
{
  name = 'RemoveUniqueKeyInNotification1699940750262';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notification\` CHANGE \`status\` \`status\` varchar(255) NOT NULL DEFAULT 'PENDING'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notification\` CHANGE \`status\` \`status\` varchar(255) NOT NULL`
    );
  }
}
