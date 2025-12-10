using GestorConversaciones.DTO.Request.Pay;
using GestorConversaciones.DTO.Result.Pay;

namespace GestorConversaciones.Services.Interface
{
    public interface IPayService
    {
        Task<PayUsersResult> CreatePayment(PayUsersRequest request);
        Task<PaymentStatusResponse> GetPaymentStatus(string paymentId);
        Task<CancelPaymentResponse> CancelPayment(string paymentId);
        Task ProcessWebhook(WebhookNotification notification);
    }
}
