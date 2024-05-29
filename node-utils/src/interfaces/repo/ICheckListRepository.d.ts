import { ApproveCheckListRequest } from "../../dto/CheckList";

export interface ICheckListRepository {
    approveCheckList(
        ApproveCheckListRequest: ApproveCheckListRequest,
        event: any
    ): Promise<any>;
}