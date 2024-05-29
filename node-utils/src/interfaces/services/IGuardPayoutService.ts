import {
  UpdateGuardPayoutRequest,
  CreateManualPayoutRequest,
} from '../../dto/GuardPayoutDTO';

export interface IGuardPayoutService {
  updatePayoutConfig(
    event: any,
    updateGuardPayoutRequest: UpdateGuardPayoutRequest
  ): Promise<any>;
  createManualPayout(
    event: any,
    createManualPayoutRequest: CreateManualPayoutRequest
  ): Promise<any>;
}
