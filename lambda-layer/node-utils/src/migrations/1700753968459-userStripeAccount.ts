import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserStripeAccount1700753968459 implements MigrationInterface {
  name = 'UserStripeAccount1700753968459';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user_stripe_accounts\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`stripe_token\` varchar(255) NOT NULL, \`routing_number\` varchar(20) NULL, \`account_last4_digits\` varchar(4) NULL, \`type\` varchar(20) NULL, \`is_primary\` int NOT NULL DEFAULT '0', \`status\` tinyint NOT NULL DEFAULT 1, \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, UNIQUE INDEX \`IDX_7adb4e1700b5a0fb927ae0942a\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_stripe_accounts\` ADD CONSTRAINT \`FK_7adb4e1700b5a0fb927ae0942ab\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_stripe_accounts\` DROP FOREIGN KEY \`FK_7adb4e1700b5a0fb927ae0942ab\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_7adb4e1700b5a0fb927ae0942a\` ON \`user_stripe_accounts\``
    );
    await queryRunner.query(`DROP TABLE \`user_stripe_accounts\``);
  }
}
