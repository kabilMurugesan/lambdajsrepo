export interface UpdateGuardPayoutRequest {
  interval: string;
  weekly_anchor: string;
  monthly_anchor: string;
}
export interface CreateManualPayoutRequest {
  amount: number;
  description: string;
}
