import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrimeIndexFee1704793540315 implements MigrationInterface {
  name = 'CrimeIndexFee1704793540315';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`crime_index_fee\` (\`id\` varchar(36) NOT NULL, \`municipality\` varchar(255) NOT NULL, \`county\` varchar(255) NOT NULL, \`crime_rate\` decimal(10,2) NULL, \`crime_index_fee\` decimal(10,2) NULL, \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`crime_index_fee\``);
  }
}
