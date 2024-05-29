import { AdminApproveRequest, AdminDeleteUserRequest } from "../../dto/AdminDTO";

export interface IAdminRepository {
    guardApprove(
        AdminApproveRequest: AdminApproveRequest,
        user: any
    ): Promise<any>;
    guardDeleteUser(
        AdminDeleteUserRequest: AdminDeleteUserRequest,
        event: any
    ): Promise<any>
}