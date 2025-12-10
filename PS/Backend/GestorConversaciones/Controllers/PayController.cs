using GestorConversaciones.DTO.Request.Pay;
using GestorConversaciones.Services.Interface;
using Login.Routes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GestorConversaciones.Controllers
{
    [ApiController]
    [Authorize]
    public class PayController : ControllerBase
    {
        private readonly IPayService _payService;
        
        public PayController(IPayService payService)
        {
            _payService = payService;
        }

        /// <summary>
        /// Crea una preferencia de pago en Mercado Pago y genera el código QR
        /// </summary>
        [HttpPost(ApiRoutes.Pay.Create)]
        public async Task<IActionResult> CreatePayment([FromBody] PayUsersRequest request)
        {
            try
            {
                var result = await _payService.CreatePayment(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Verifica el estado de un pago
        /// </summary>
        [HttpGet(ApiRoutes.Pay.Status)]
        public async Task<IActionResult> GetPaymentStatus(string paymentId)
        {
            try
            {
                var result = await _payService.GetPaymentStatus(paymentId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Cancela un pago pendiente
        /// </summary>
        [HttpPost(ApiRoutes.Pay.Cancel)]
        public async Task<IActionResult> CancelPayment(string paymentId)
        {
            try
            {
                var result = await _payService.CancelPayment(paymentId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Webhook para recibir notificaciones de Mercado Pago cuando un pago es procesado
        /// </summary>
        [AllowAnonymous] // El webhook viene de Mercado Pago, no tiene token
        [HttpPost(ApiRoutes.Pay.Webhook)]
        public async Task<IActionResult> PaymentWebhook([FromBody] WebhookNotification notification)
        {
            try
            {
                await _payService.ProcessWebhook(notification);
                return Ok();
            }
            catch (Exception ex)
            {
                // Log del error pero devolver OK para no afectar al webhook
                Console.WriteLine($"Error en webhook: {ex.Message}");
                return Ok();
            }
        }
    }
}
