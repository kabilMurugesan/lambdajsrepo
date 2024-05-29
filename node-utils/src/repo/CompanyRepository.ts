import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';
import { GlobalConstants } from '../constants/constants';
import { ICompanyDetailsRepository } from '../interfaces/repo/ICompanyDetailsRepository';
import {
    CompanyDetailsRequest,
    EditCompanyDetailsRequest,
} from '../dto/CompanyDetailsDTO';
import { Company } from '../entities/Company';
import { Team } from '../entities/Team';
import { TeamMembers } from '../entities/TeamMembers';
import { UserProfile } from '../entities/UserProfile';
import { externalConfig } from '../configuration/externalConfig';

@injectable()
export class CompanyDetailsRepository implements ICompanyDetailsRepository {
    private readonly awsData: any = externalConfig.AWS;

    constructor(
        @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService,
        @inject(TYPES.IAwsService) private readonly awsService: IAwsService,
        private readonly globalConstants = GlobalConstants
    ) { }
    async createComapnyDetails(
        companyDetailsRequest: CompanyDetailsRequest,
        user: any
    ): Promise<any> {
        const userId = user.id;
        const repo = await this.database.getRepository(Company);
        const teamRepo = await this.database.getRepository(Team);
        const teamMembers = await this.database.getRepository(TeamMembers);
        const userProfile = await this.database.getRepository(UserProfile);

        const companyNameCheck: any = await repo.findOneBy({
            companyName: companyDetailsRequest.companyName,
        });
        if (companyNameCheck) {
            return ({ "data": "", "message": "CompanyName Already Exist." })
        }
        const insertedCompany = await repo.insert({
            companyName: companyDetailsRequest.companyName,
            companyEmail: companyDetailsRequest.companyEmail ? companyDetailsRequest.companyEmail : "",
            companyPhone: companyDetailsRequest.companyPhone ? companyDetailsRequest.companyPhone : "",
            street1: companyDetailsRequest.street1,
            street2: companyDetailsRequest.street2,
            country: companyDetailsRequest.country,
            city: companyDetailsRequest.city,
            companyPhotoFileName: companyDetailsRequest.companyPhotoFileName,
            updatedBy: this.globalConstants.SYS_ADMIN_GUID,
            createdBy: this.globalConstants.SYS_ADMIN_GUID,
            updatedOn: new Date(),
            createdOn: new Date(),
        });
        const generatedMaps = insertedCompany.generatedMaps;
        if (generatedMaps.length === 0) {
            throw new Error('Auto-generated ID not found');
        }
        const generatedId = await generatedMaps[0].id;
        const company: Company = await repo.findOneBy({
            id: generatedId,
        });

        await teamRepo.insert({
            name: companyDetailsRequest.teamName,
            companyId: generatedId,
            updatedBy: this.globalConstants.SYS_ADMIN_GUID,
            createdBy: this.globalConstants.SYS_ADMIN_GUID,
            updatedOn: new Date(),
            createdOn: new Date(),
        });

        const teamResponse: any = await teamRepo.findOneBy({
            companyId: generatedId,
        });
        await teamMembers.insert({
            teamId: teamResponse.id,
            userId: userId,
            isLead: true,
            updatedBy: this.globalConstants.SYS_ADMIN_GUID,
            createdBy: this.globalConstants.SYS_ADMIN_GUID,
            updatedOn: new Date(),
            createdOn: new Date(),
        });
        await userProfile.update(
            { userId: userId },
            {
                IsCompanyAdded: true,
            }
        );
        // let profileImageUrl = '';
        // if (
        //     company.companyPhotoFileName != '' &&
        //     company.companyPhotoFileName != null
        // ) {
        //     const profileImage = await this.awsService.getPreSignedUrl(
        //         `${this.awsData.profileImageFolder}/${company.companyPhotoFileName}`,
        //         900, "image"
        //     );
        //     if (profileImage != null && profileImage != '') {
        //         profileImageUrl = profileImage;
        //     } else {
        //         profileImageUrl = '';
        //     }
        // }
        // company.companyPhotoFileName = profileImageUrl;
        const response = await userProfile
            .createQueryBuilder('userProfile')
            .where('userProfile.userId = :userId', { userId })
            .innerJoinAndSelect('userProfile.user', 'user')
            .getOne();
        return { ...response, company };
    }
    async editCompanyDetails(
        companyDetailsRequest: EditCompanyDetailsRequest,
        user: any
    ): Promise<any> {
        const comapnyrepo = await this.database.getRepository(Company);
        const teamRepo = await this.database.getRepository(Team);
        // const teamMembers = await this.database.getRepository(TeamMembers)
        const userProfile = await this.database.getRepository(UserProfile);
        const userId = user.id;
        const companyCheck: Company = await comapnyrepo.findOneBy({
            id: companyDetailsRequest.companyId,
        });
        if (!companyCheck) {
            return { data: '', message: 'CompanyId doesnot exist.' };
        }
        const teamNameCheck: Team = await teamRepo.findOneBy({
            companyId: companyDetailsRequest.companyId
        });
        if (teamNameCheck.name != "" && teamNameCheck.name === companyDetailsRequest.teamName) {
            return ({ "data": "", "message": "TeamName Already Exist.Please Select Another Name." })
        }
        await comapnyrepo.update(
            { id: companyDetailsRequest.companyId },
            {
                companyName: companyDetailsRequest.companyName,
                companyEmail: companyDetailsRequest.companyEmail,
                companyPhone: companyDetailsRequest.companyPhone,
                street1: companyDetailsRequest.street1,
                street2: companyDetailsRequest.street2,
                country: companyDetailsRequest.country,
                city: companyDetailsRequest.city,
                // zipCode: companyDetailsRequest.zipCode,
                companyPhotoFileName: companyDetailsRequest.companyPhotoFileName,
                // companyPhotoFile: companyDetailsRequest.companyPhotoFile,
                updatedBy: this.globalConstants.SYS_ADMIN_GUID,
                createdBy: this.globalConstants.SYS_ADMIN_GUID,
                updatedOn: new Date(),
                createdOn: new Date(),
            }
        );
        const company: Company = await comapnyrepo.findOneBy({
            id: companyDetailsRequest.companyId,
        });

        await teamRepo.update(
            { companyId: companyDetailsRequest.companyId },
            {
                name: companyDetailsRequest.teamName,
                companyId: company.id,
                updatedBy: this.globalConstants.SYS_ADMIN_GUID,
                createdBy: this.globalConstants.SYS_ADMIN_GUID,
                updatedOn: new Date(),
                createdOn: new Date(),
            }
        );
        // let profileImageUrl = '';
        // if (
        //     company.companyPhotoFileName != '' &&
        //     company.companyPhotoFileName != null
        // ) {
        //     const profileImage = await this.awsService.getPreSignedUrl(
        //         `${this.awsData.profileImageFolder}/${company.companyPhotoFileName}`,
        //         900, "image"
        //     );
        //     if (profileImage != null && profileImage != '') {
        //         profileImageUrl = profileImage;
        //     } else {
        //         profileImageUrl = '';
        //     }
        // }
        // company.companyPhotoFileName = profileImageUrl;
        const response = await userProfile
            .createQueryBuilder('userProfile')
            .where('userProfile.userId = :userId', { userId })
            .innerJoinAndSelect('userProfile.user', 'user')
            .getOne();
        return { ...response, company };
        // return response;
    }
}
