import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserStripeDetails1700670515959 implements MigrationInterface {
  name = 'UserStripeDetails1700670515959';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user_stripe_details\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`stripe_account_id\` varchar(255) NULL, \`stripe_customer_id\` varchar(255) NULL, \`is_stripe_verified\` int NOT NULL DEFAULT '1', \`status\` tinyint NOT NULL DEFAULT 1, \`created_by\` varchar(255) NULL, \`created_on\` timestamp NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, UNIQUE INDEX \`IDX_c537535f36283802e5f668e312\` (\`user_id\`), UNIQUE INDEX \`REL_c537535f36283802e5f668e312\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_stripe_details\` ADD CONSTRAINT \`FK_c537535f36283802e5f668e312b\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_stripe_details\` DROP FOREIGN KEY \`FK_c537535f36283802e5f668e312b\``
    );
    await queryRunner.query(
      `DROP INDEX \`REL_c537535f36283802e5f668e312\` ON \`user_stripe_details\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_c537535f36283802e5f668e312\` ON \`user_stripe_details\``
    );
    await queryRunner.query(`DROP TABLE \`user_stripe_details\``);
  }
}
