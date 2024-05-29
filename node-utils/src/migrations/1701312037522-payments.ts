import { MigrationInterface, QueryRunner } from 'typeorm';

export class Payments1701312037522 implements MigrationInterface {
  name = 'Payments1701312037522';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`payments\` (\`id\` varchar(36) NOT NULL, \`transaction_id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`stripe_charge_id\` varchar(50) NULL, \`payment_intent_id\` varchar(20) NULL, \`amount_cents\` int NULL, \`amount_currency\` varchar(5) NULL, \`stripe_fee_cents\` int NULL, \`stripe_fee_currency\` varchar(5) NULL, \`load_payments\` decimal(10,2) NULL, \`fee_cents\` int NULL, \`fee_currency\` varchar(5) NULL, \`refund_amount_cents\` int NULL, \`refund_amount_currency\` varchar(5) NULL, \`payment_type\` varchar(45) NULL, \`txn_type\` varchar(45) NULL, \`payment_method\` varchar(45) NULL, \`last4\` varchar(4) NULL, \`payout\` int NOT NULL DEFAULT '2', \`payout_amount\` decimal(10,2) NULL, \`payout_id\` varchar(45) NULL, \`brand_bank\` varchar(45) NULL, \`transfer_id\` varchar(45) NULL, \`refund_id\` varchar(45) NULL, \`refund_amount\` decimal(10,2) NULL, \`payment_status\` int NULL, \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, UNIQUE INDEX \`IDX_3c324ca49dabde7ffc0ef64675\` (\`transaction_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_427785468fb7d2733f59e7d7d39\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_427785468fb7d2733f59e7d7d39\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_3c324ca49dabde7ffc0ef64675\` ON \`payments\``
    );
    await queryRunner.query(`DROP TABLE \`payments\``);
  }
}
