import { AddRadiusRequest, editRadiusRequest } from '../../dto/RadiusDTO';
import { Settings } from '../../entities/Settings';

export interface IRadiusService {
  createSettingsRequest(CreateRadiusRequest: AddRadiusRequest): Promise<any>;
  getSettings(): Promise<any>;
  deleteSettings(id: string): Promise<any>;
  editSettings(editRadiusRequest: editRadiusRequest): Promise<any>;
}
