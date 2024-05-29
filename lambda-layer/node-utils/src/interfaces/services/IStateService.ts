import { City } from '../../entities/City';
import { State } from '../../entities/State';

export interface IStateService {
  getStateList(): Promise<State[]>;
  getCityListByState(stateId: any): Promise<City[]>;
}
