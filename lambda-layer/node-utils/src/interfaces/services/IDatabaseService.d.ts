import { ObjectType, Repository, QueryRunner } from 'typeorm';

declare interface IDatabaseService {
  getRepository(entity: ObjectType<any>): Promise<Repository<any>>;
  createQueryRunner(): Promise<QueryRunner>;
}
