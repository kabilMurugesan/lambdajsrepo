import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedAditionallyParamsToJob1701411656951
  implements MigrationInterface
{
  name = 'AddedAditionallyParamsToJob1701411656951';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`job_cost\` decimal(10,2) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`commission_fee_percentage\` decimal(10,2) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`commission_cost\` decimal(10,2) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`stripe_transaction_fee_percentage\` decimal(10,2) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`transaction_cost\` decimal(10,2) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`total_cost\` decimal(10,2) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`payment_status\` int NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`payment_type\` varchar(10) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`last4\` varchar(10) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`payment_source\` varchar(10) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`payment_method\` varchar(45) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`stripe_charge_id\` varchar(45) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`transaction_date\` timestamp NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`transaction_date\``
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`stripe_charge_id\``
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`payment_method\``
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`payment_source\``
    );
    await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`last4\``);
    await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`payment_type\``);
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`payment_status\``
    );
    await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`total_cost\``);
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`transaction_cost\``
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`stripe_transaction_fee_percentage\``
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`commission_cost\``
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP COLUMN \`commission_fee_percentage\``
    );
    await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`job_cost\``);
  }
}
