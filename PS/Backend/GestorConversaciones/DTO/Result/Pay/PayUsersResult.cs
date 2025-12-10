namespace GestorConversaciones.DTO.Result.Pay
{
    public class PayUsersResult
    {
        public string QrData { get; set; }
        public string PaymentId { get; set; }
        public double Amount { get; set; }
        public string ExternalReference { get; set; }
    }
}
