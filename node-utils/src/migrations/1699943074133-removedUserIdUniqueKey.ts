import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovedUserIdUniqueKey1699943074133 implements MigrationInterface {
  name = 'RemovedUserIdUniqueKey1699943074133';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`REL_928b7aa1754e08e1ed7052cb9d\` ON \`notification\``
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_928b7aa1754e08e1ed7052cb9d\` ON \`notification\` (\`user_id\`)`
    );
  }
}
