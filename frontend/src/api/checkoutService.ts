export type ExperimentVariant = 'CONTROL' | 'VARIANT_B';

export interface VariantResponse {
  userId: string;
  variant: ExperimentVariant;
}

export interface PaymentPayload {
  userId: string;
  cardCvv: string;
  variant: ExperimentVariant;
}

export interface PaymentResult {
  status: 'SUCCESS' | 'FAILED';
  message: string;
  transactionId?: string;
  errorCode?: string;
}

const API_BASE_URL = 'http://localhost:8080/api/v1/checkout';

export const checkoutService = {
  async fetchVariant(userId: string): Promise<ExperimentVariant> {
    const res = await fetch(`${API_BASE_URL}/variant?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to fetch experiment variant from service');
    const data: VariantResponse = await res.json();
    return data.variant;
  },

  async processPayment(payload: PaymentPayload, idempotencyKey: string): Promise<PaymentResult> {
    const res = await fetch(`${API_BASE_URL}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    const data: PaymentResult = await res.json();
    return data;
  },
};