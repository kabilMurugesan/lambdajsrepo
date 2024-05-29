import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { ICheckListService } from '../interfaces/services/ICheckListService';
import { ICheckListRepository } from '../interfaces/repo/ICheckListRepository';
import { ApproveCheckListRequest } from '../dto/CheckList';

@injectable()
export class checkListService implements ICheckListService {
    constructor(
        @inject(TYPES.ICheckListRepository)
        private readonly ChangePasswordRepository: ICheckListRepository,
        @inject(TYPES.IAuthService)
        private readonly authService: IAuthService
    ) { }
    async approveCheckList(
        ApproveCheckListRequestPayload: ApproveCheckListRequest,
        event: any
    ): Promise<any> {
        const user = await this.authService.decodeJwt(event);
        const approveCheckList: any = await this.ChangePasswordRepository.approveCheckList(
            ApproveCheckListRequestPayload,
            user
        );
        return approveCheckList;
    }
}
