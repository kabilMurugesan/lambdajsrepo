import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';
import { IRadiusRepository } from '../interfaces/repo/IRadiusRepository';
import { AddRadiusRequest, editRadiusRequest } from '../dto/RadiusDTO';
import { Settings } from '../entities/Settings';
import { GlobalConstants } from '../constants/constants';

@injectable()
export class RadiusRepository implements IRadiusRepository {
    constructor(
        @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService,
        private readonly globalConstants = GlobalConstants
    ) { }
    async createSettingsRequest(
        createRadiusPayload: AddRadiusRequest,
    ): Promise<any> {
        const repo = await this.database.getRepository(Settings);
        const insertPromises = createRadiusPayload?.values?.map(async (savejob) => {
            const jobGuardData: any = {
                type: savejob.type,
                value: savejob.value,
                updatedBy: this.globalConstants.SYS_ADMIN_GUID,
                createdBy: this.globalConstants.SYS_ADMIN_GUID,
                updatedOn: new Date(),
                createdOn: new Date(),
            };
            await repo.insert(jobGuardData);
        });
        await Promise.all(insertPromises);
        const response: any = await repo.find({
        });
        return response;
    }


    async deleteSettings(
        id: string,
    ): Promise<any> {
        const repo = await this.database.getRepository(Settings);
        const radiusCheck: any = await repo.findOneBy({
            id: id
        });
        if (!radiusCheck || radiusCheck == "") {
            return ({ "data": "", "message": "Please Enter Proper ID." });
        }

        const response = await repo.delete({ id: id });

        return response //<GuardJobInterest>
    }

    async getSettings(): Promise<any> {
        const repo = await this.database.getRepository(Settings);

        const response: any = await repo.find({
        });
        let queryBuilder = repo
            .createQueryBuilder('settings')
            .select([
                'CAST(settings.value AS DECIMAL) AS value',
                'settings.type as type',
            ])
            .where('settings.type = :minType OR settings.type = :maxType OR settings.type = :incrementType', {
                minType: 'minRadiusPercentage',
                maxType: 'maxRadiusPercentage',
                incrementType: 'incrementBy',
            });
        const radiusResponse = await queryBuilder.getRawMany();

        const responses = radiusResponse.map((setting: any) => {
            setting.value = parseFloat(setting?.value);
        })
        await Promise.all(responses);
        return { ...response, radius: radiusResponse };
    }

    async editSettings(
        editRadiusRequest: editRadiusRequest,
    ): Promise<any> {
        const settingsRepository = await this.database.getRepository(Settings);

        // Find the specific record by ID
        const settingToUpdate = await settingsRepository.findOne({ where: { id: editRadiusRequest.id } });
        if (!settingToUpdate || settingToUpdate == "") {
            return ({ "data": "", "message": "Please Enter Proper ID." });
        }

        // Update the record with the new values
        settingToUpdate.type = editRadiusRequest.type;
        settingToUpdate.value = editRadiusRequest.value;
        settingToUpdate.updatedBy = 'SYS_ADMIN_GUID';
        settingToUpdate.updatedOn = new Date();

        // Save the updated record
        await settingsRepository.save(settingToUpdate);

        // Return the updated record
        return settingToUpdate;
    }
}
