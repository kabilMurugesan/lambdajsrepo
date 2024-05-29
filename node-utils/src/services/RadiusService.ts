import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IRadiusService } from '../interfaces/services/IRadiusService';
import { IRadiusRepository } from '../interfaces/repo/IRadiusRepository';
import { AddRadiusRequest, editRadiusRequest } from '../dto/RadiusDTO';

@injectable()
export class RadiusService implements IRadiusService {
  constructor(
    @inject(TYPES.IRadiusRepository)
    private readonly RadiusRepository: IRadiusRepository
  ) { }

  async createSettingsRequest(
    createRadiusRequest: AddRadiusRequest
  ): Promise<any> {
    return await this.RadiusRepository.createSettingsRequest(createRadiusRequest);
  }

  async getSettings(): Promise<any> {
    return await this.RadiusRepository.getSettings();
  }
  async deleteSettings(id: string): Promise<any> {
    return await this.RadiusRepository.deleteSettings(id);
  }
  async editSettings(editRadiusRequest: editRadiusRequest): Promise<any> {
    return await this.RadiusRepository.editSettings(editRadiusRequest);
  }
}
