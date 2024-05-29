import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IStateRepository } from '../interfaces/repo/IStateRepository';
import { IStateService } from '../interfaces/services/IStateService';
import { State } from '../entities/State';
import { City } from '../entities/City';

@injectable()
export class StateService implements IStateService {
  constructor(
    @inject(TYPES.IStateRepository)
    private readonly StateRepository: IStateRepository
  ) {}

  async getStateList(): Promise<State[]> {
    return await this.StateRepository.getStateList();
  }

  async getCityListByState(stateId: any): Promise<City[]> {
    return await this.StateRepository.getCityListByState(stateId);
  }
}
