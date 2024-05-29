import { AdminApproveRequest, AdminDeleteUserRequest } from '../../dto/AdminDTO';

export interface IAdminService {
  guardApprove(
    AdminApproveRequest: AdminApproveRequest,
    event: any
  ): Promise<any>;
  guardDeleteUser(
    AdminDeleteUserRequest: AdminDeleteUserRequest,
    event: any
  ): Promise<any>
}
