import apiClient from '../config/api';

export interface CreatePaymentRequest {
  quantity: number;
  title?: string;
  description?: string;
}

export interface PaymentResponse {
  qrData: string; // Base64 del QR o URL de la imagen
  paymentId: string;
  amount: number;
  externalReference: string;
}

export interface PaymentStatus {
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  paymentId: string;
  availableAdded?: number;
}

class PaymentService {
  /**
   * Crea una solicitud de pago y obtiene el QR de Mercado Pago
   */
  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    const res = await apiClient.post<PaymentResponse>('/payment/create', {
      Quantity: request.quantity,
      Title: request.title || 'Compra de usuarios adicionales',
      Description: request.description || `${request.quantity} usuario(s) adicional(es)`,
    });
    return res.data;
  }

  /**
   * Verifica el estado de un pago
   */
  async checkPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const res = await apiClient.get<PaymentStatus>(`/payment/status/${paymentId}`);
    return res.data;
  }

  /**
   * Cancela un pago pendiente
   */
  async cancelPayment(paymentId: string): Promise<void> {
    await apiClient.post(`/payment/cancel/${paymentId}`);
  }
}

export const paymentService = new PaymentService();

