import { City } from '../../entities/City';
import { State } from '../../entities/State';

export interface IStateRepository {
  getStateList(): Promise<State[]>;
  getCityListByState(stateId: any): Promise<City[]>;
}
