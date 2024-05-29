import { ApproveCheckListRequest } from "../../dto/CheckList";

export interface ICheckListService {
    approveCheckList(
        ApproveCheckListRequest: ApproveCheckListRequest,
        event: any
    ): Promise<any>;
}