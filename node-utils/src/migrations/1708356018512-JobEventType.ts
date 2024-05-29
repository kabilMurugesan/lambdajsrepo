import { MigrationInterface, QueryRunner } from 'typeorm';

export class JobEventType1708356018512 implements MigrationInterface {
  name = 'JobEventType1708356018512';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`job_event_types\` (\`id\` varchar(36) NOT NULL, \`job_id\` varchar(255) NOT NULL, \`job_interest_id\` varchar(255) NOT NULL, \`created_by\` varchar(255) NOT NULL, \`created_on\` timestamp NOT NULL, \`updated_by\` varchar(255) NULL, \`updated_on\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`job_event_types\` ADD CONSTRAINT \`FK_9ead7270b80b9a7bfcc9e774ef1\` FOREIGN KEY (\`job_id\`) REFERENCES \`job\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`job_event_types\` ADD CONSTRAINT \`FK_7e4d4edca4b1dae9b4686005a42\` FOREIGN KEY (\`job_interest_id\`) REFERENCES \`job_interest\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job_event_types\` DROP FOREIGN KEY \`FK_7e4d4edca4b1dae9b4686005a42\``
    );
    await queryRunner.query(
      `ALTER TABLE \`job_event_types\` DROP FOREIGN KEY \`FK_9ead7270b80b9a7bfcc9e774ef1\``
    );

    await queryRunner.query(`DROP TABLE \`job_event_types\``);
  }
}
