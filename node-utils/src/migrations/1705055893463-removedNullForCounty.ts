import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovedNullForCounty1705055893463 implements MigrationInterface {
  name = 'RemovedNullForCounty1705055893463';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`crime_index_fee\` CHANGE \`county\` \`county\` varchar(255) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`crime_index_fee\` CHANGE \`county\` \`county\` varchar(255) NOT NULL`
    );
  }
}
