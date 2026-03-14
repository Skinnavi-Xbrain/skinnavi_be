export interface EligibilityResponse {
  requiresPayment: boolean;
  isFreeTrial: boolean;
  hasActivePackage: boolean;
  currentPackage: {
    name: string;
    endDate: Date;
  } | null;
}

export type CreatePaymentResponse =
  | { url: string }
  | { isFreeTrial: boolean; message: string }
  | { hasActivePackage: boolean; currentPackage: any; message: string }; // Trường hợp cần xác nhận ghi đè
