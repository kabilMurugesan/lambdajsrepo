import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedPaymentFields1701422659879 implements MigrationInterface {
  name = 'AddedPaymentFields1701422659879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payments\` DROP COLUMN \`load_payments\``
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` ADD \`job_id\` varchar(255) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` ADD \`amount\` decimal(10,2) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_f83af8ea8055b85bde0e095e400\` FOREIGN KEY (\`job_id\`) REFERENCES \`job\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_f83af8ea8055b85bde0e095e400\``
    );
    await queryRunner.query(`ALTER TABLE \`payments\` DROP COLUMN \`amount\``);
    await queryRunner.query(`ALTER TABLE \`payments\` DROP COLUMN \`job_id\``);
    await queryRunner.query(
      `ALTER TABLE \`payments\` ADD \`load_payments\` decimal NULL`
    );
  }
}
