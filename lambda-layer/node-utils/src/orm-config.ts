import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { getEntities } from './entities/entities';
import { getMigrations } from './migrations/migrations';
//  import { config } from "dotenv";

// /** Load env file */
//  config({ path: "../../.env" });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'dev-fi-db.canvgapjnqzv.us-east-2.rds.amazonaws.com',
  port: 3306,
  username: 'devfidoadmin',
  password: 'AsRVSTql8CLXzhFz4Lv9z7TBbw',
  database: 'dev_fido',
  synchronize: false,
  logging: true,
  entities: getEntities(),
  subscribers: [],
  migrations: getMigrations(),
  migrationsTableName: 'migrations_typeorm',
  namingStrategy: new SnakeNamingStrategy(),
  multipleStatements: true,
  extra: {
    connectionLimit: 5
  }
});
