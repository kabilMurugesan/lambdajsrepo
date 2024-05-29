import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';
import { IStateRepository } from '../interfaces/repo/IStateRepository';
import { State } from '../entities/State';
import { City } from '../entities/City';

@injectable()
export class StateRepository implements IStateRepository {
  constructor(
    @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService
  ) {}
  async getStateList(): Promise<State[]> {
    const repo = await this.database.getRepository(State);
    const response = await repo
      .createQueryBuilder('state')
      .select(['state.id as id', 'state.name as name'])
      .innerJoin('state.cities', 'city', 'city.stateId = state.id')
      .where({
        status: 1,
      })
      .groupBy('state.id')
      .orderBy('state.name', 'ASC')
      .getRawMany();
    return response;
  }
  async getCityListByState(stateId: any): Promise<City[]> {
    const repo = await this.database.getRepository(City);
    const response = await repo.find({
      where: {
        status: 1,
        stateId,
      },
      select: {
        id: true,
        name: true,
      },
      order: {
        name: 'ASC',
      },
    });
    return response;
  }
}
