import { injectable } from 'inversify';
import { DataSource, ObjectType, Repository, QueryRunner } from 'typeorm';
import { AppDataSource } from '../orm-config';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';

@injectable()
export class DatabaseService implements IDatabaseService {
  private static _dataSource: DataSource;

  private async getConnection(): Promise<DataSource> {
    console.log('getConnection called');
    if (DatabaseService._dataSource?.isInitialized) {
      console.log('DS was Initialized');
      return DatabaseService._dataSource;
    }
    console.log('DS was not Initialized');
    try {
      console.log('calling initialize');
      DatabaseService._dataSource = await AppDataSource.initialize();
      console.log('initialize called');
    } catch (error) {
      console.log(error);
    }
    return DatabaseService._dataSource;
  }

  public async getRepository(
    entity: ObjectType<any>
  ): Promise<Repository<any>> {
    const connection = await this.getConnection();
    return connection?.getRepository(entity);
  }

  public async createQueryRunner(): Promise<QueryRunner> {
    const connection = await this.getConnection();
    return connection?.createQueryRunner();
  }
}
