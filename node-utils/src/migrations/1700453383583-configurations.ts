import { MigrationInterface, QueryRunner } from 'typeorm';

export class Configurations1700453383583 implements MigrationInterface {
  name = 'Configurations1700453383583';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`configurations\` (\`id\` varchar(36) NOT NULL, \`commission_fee_percentage\` decimal(10,2) NOT NULL COMMENT 'FIDO COMMISSION FEE PERCENTAGE', \`stripe_transaction_fee_percentage\` decimal(10,2) NOT NULL COMMENT 'STRIPE TRANSACTION FEE PERCENTAGE', \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`configurations\``);
  }
}
