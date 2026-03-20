export class ValidateSubscriptionResponse {
  isValid: boolean;
  message: string;
  data?: {
    subscriptionId: string;
    packageName: string;
    endDate: Date;
  } | null;
}
