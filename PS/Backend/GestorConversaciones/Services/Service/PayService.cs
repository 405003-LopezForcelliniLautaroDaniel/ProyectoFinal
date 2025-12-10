using GestorConversaciones.DTO.Request.Pay;
using GestorConversaciones.DTO.Result.Pay;
using GestorConversaciones.Services.Interface;
using MercadoPago.Client.Payment;
using MercadoPago.Client.Preference;
using MercadoPago.Config;
using MPPayment = MercadoPago.Resource.Payment.Payment;
using Login.DataBase;
using Microsoft.EntityFrameworkCore;
using GestorConversaciones.Models;
using GestorConversaciones.Helper;

namespace GestorConversaciones.Services.Service
{
    public class PayService : IPayService
    {
        private readonly Context _context;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public PayService(Context context, IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PayUsersResult> CreatePayment(PayUsersRequest request)
        {
            try
            {
                Guid idCompany = _httpContextAccessor.HttpContext.GetIdCompany();
                Guid userId = _httpContextAccessor.HttpContext.GetIdUser();
                // Configurar el access token desde appsettings.json
                var accessToken = _configuration["PaymentSettings:MercadoPagoAccessToken"];
                MercadoPagoConfig.AccessToken = accessToken;

                // Obtener el precio por usuario desde configuración
                var pricePerUserConfig = _configuration["PaymentSettings:PricePerUser"];
                decimal pricePerUser = decimal.Parse(pricePerUserConfig ?? "1000");
                decimal totalAmount = request.Quantity * pricePerUser;

                // Obtener el usuario para el email
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null)
                {
                    throw new Exception("Usuario no encontrado");
                }

                // Crear referencia externa única
                string externalReference = $"USER_PAYMENT_{userId}_{DateTime.Now.Ticks}";

                // Crear una preferencia de pago (Checkout Pro) para generar link de pago/QR
                var preferenceRequest = new PreferenceRequest
                {
                    Items = new List<PreferenceItemRequest>
                    {
                        new PreferenceItemRequest
                        {
                            Title = request.Title ?? "Usuarios adicionales",
                            Description = request.Description ?? $"Compra de {request.Quantity} usuario(s) adicional(es)",
                            Quantity = 1,
                            CurrencyId = "ARS",
                            UnitPrice = totalAmount
                        }
                    },
                    Payer = new PreferencePayerRequest
                    {
                        Email = user.Email,
                        Name = user.FirstName,
                        Surname = user.LastName
                    },
                    ExternalReference = externalReference,
                    BackUrls = new PreferenceBackUrlsRequest
                    {
                        Success = "https://tu-dominio.com/success",
                        Failure = "https://tu-dominio.com/failure",
                        Pending = "https://tu-dominio.com/pending"
                    },
                    AutoReturn = "approved"
                };

                var client = new PreferenceClient();
                var preference = await client.CreateAsync(preferenceRequest);

                // Guardar en base de datos
                var paymentRecord = new Payment
                {
                    Id = Guid.NewGuid(),
                    MercadoPagoId = preference.Id,
                    UserId = userId,
                    CompanyId = idCompany,
                    Quantity = request.Quantity,
                    Amount = totalAmount,
                    Status = "pending",
                    ExternalReference = externalReference,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.Payments.AddAsync(paymentRecord);
                await _context.SaveChangesAsync();

                // Retornar el link de pago - El frontend lo convertirá en QR
                return new PayUsersResult
                {
                    QrData = preference.InitPoint, // Link de pago que el frontend convierte en QR
                    PaymentId = paymentRecord.Id.ToString(),
                    Amount = (double)totalAmount,
                    ExternalReference = externalReference
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al crear el pago: {ex.Message}");
            }
        }

        public async Task<PaymentStatusResponse> GetPaymentStatus(string paymentId)
        {
            try
            {
                // Buscar el pago en la base de datos
                var paymentRecord = await _context.Payments
                    .FirstOrDefaultAsync(p => p.Id == Guid.Parse(paymentId));

                if (paymentRecord == null)
                {
                    throw new Exception("Pago no encontrado");
                }

                // Si ya está aprobado, devolver el estado guardado
                if (paymentRecord.Status == "approved")
                {
                    return new PaymentStatusResponse
                    {
                        Status = paymentRecord.Status,
                        PaymentId = paymentId,
                        AvailableAdded = paymentRecord.Quantity
                    };
                }

                // Si está pendiente, consultar a Mercado Pago para ver si cambió
                try
                {
                    // Configurar el access token
                    var accessToken = _configuration["PaymentSettings:MercadoPagoAccessToken"];
                    MercadoPagoConfig.AccessToken = accessToken;

                    // Buscar pagos con el external_reference usando la API REST directamente
                    var httpClient = new HttpClient();
                    httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
                    
                    var url = $"https://api.mercadopago.com/v1/payments/search?external_reference={paymentRecord.ExternalReference}";
                    var response = await httpClient.GetAsync(url);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var content = await response.Content.ReadAsStringAsync();
                        var searchResult = System.Text.Json.JsonDocument.Parse(content);
                        
                        if (searchResult.RootElement.TryGetProperty("results", out var results) && results.GetArrayLength() > 0)
                        {
                            // Buscar un pago aprobado
                            foreach (var result in results.EnumerateArray())
                            {
                                if (result.TryGetProperty("status", out var statusElement))
                                {
                                    var status = statusElement.GetString();
                                    if (status == "approved")
                                    {
                                        // Actualizar el estado en la base de datos
                                        paymentRecord.Status = "approved";
                                        paymentRecord.ProcessedAt = DateTime.UtcNow;

                                        // Crear múltiples registros en AddUser, uno por cada usuario comprado
                                        decimal pricePerUser = paymentRecord.Amount / paymentRecord.Quantity;
                                        
                                        for (int i = 0; i < paymentRecord.Quantity; i++)
                                        {
                                            var addUser = new AddUser
                                            {
                                                Id = Guid.NewGuid(),
                                                IdCompany = paymentRecord.CompanyId,
                                                UserId = null, // Se asignará cuando se cree el usuario
                                                Price = (int)pricePerUser,
                                                Pay = DateTime.UtcNow,
                                                Expiration = DateTime.UtcNow.AddYears(1)
                                            };
                                            await _context.AddUsers.AddAsync(addUser);
                                        }

                                        _context.Payments.Update(paymentRecord);
                                        await _context.SaveChangesAsync();

                                        return new PaymentStatusResponse
                                        {
                                            Status = "approved",
                                            PaymentId = paymentId,
                                            AvailableAdded = paymentRecord.Quantity
                                        };
                                    }
                                    else if (status == "rejected" || status == "cancelled")
                                    {
                                        // Actualizar estado rechazado/cancelado
                                        paymentRecord.Status = status;
                                        _context.Payments.Update(paymentRecord);
                                        await _context.SaveChangesAsync();
                                    }
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error consultando Mercado Pago: {ex.Message}");
                    // Continuar y devolver el estado de la BD si falla la consulta
                }

                // Devolver el estado actual
                return new PaymentStatusResponse
                {
                    Status = paymentRecord.Status,
                    PaymentId = paymentId,
                    AvailableAdded = paymentRecord.Status == "approved" ? paymentRecord.Quantity : 0
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener el estado del pago: {ex.Message}");
            }
        }

        public async Task<CancelPaymentResponse> CancelPayment(string paymentId)
        {
            try
            {
                var paymentRecord = await _context.Payments
                    .FirstOrDefaultAsync(p => p.Id == Guid.Parse(paymentId));

                if (paymentRecord == null)
                {
                    throw new Exception("Pago no encontrado");
                }

                if (paymentRecord.Status == "approved")
                {
                    throw new Exception("No se puede cancelar un pago aprobado");
                }

                // Actualizar estado en la base de datos
                paymentRecord.Status = "cancelled";
                paymentRecord.CancelledAt = DateTime.UtcNow;
                _context.Payments.Update(paymentRecord);
                await _context.SaveChangesAsync();

                return new CancelPaymentResponse
                {
                    Message = "Pago cancelado exitosamente"
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al cancelar el pago: {ex.Message}");
            }
        }

        public async Task ProcessWebhook(WebhookNotification notification)
        {
            try
            {
                if (notification.Type != "payment")
                {
                    return; // Ignorar notificaciones que no son de pagos
                }

                var paymentId = notification.Data.Id;

                // Configurar el access token
                var accessToken = _configuration["PaymentSettings:MercadoPagoAccessToken"];
                MercadoPagoConfig.AccessToken = accessToken;

                // Consultar el pago en Mercado Pago
                var client = new PaymentClient();
                var payment = await client.GetAsync(long.Parse(paymentId));

                if (payment == null || string.IsNullOrEmpty(payment.ExternalReference))
                {
                    return; // No tiene external reference, no podemos identificarlo
                }

                // Buscar el registro en nuestra base de datos por external_reference
                var paymentRecord = await _context.Payments
                    .FirstOrDefaultAsync(p => p.ExternalReference == payment.ExternalReference);

                if (paymentRecord == null)
                {
                    return; // Pago no encontrado en nuestra base de datos
                }

                // Actualizar el estado
                var oldStatus = paymentRecord.Status;
                paymentRecord.Status = payment.Status;

                // Si cambió a "approved", crear registros en AddUser
                if (oldStatus != "approved" && payment.Status == "approved")
                {
                    // Crear múltiples registros en AddUser, uno por cada usuario comprado
                    decimal pricePerUser = paymentRecord.Amount / paymentRecord.Quantity;
                    
                    for (int i = 0; i < paymentRecord.Quantity; i++)
                    {
                        var addUser = new AddUser
                        {
                            Id = Guid.NewGuid(),
                            IdCompany = paymentRecord.CompanyId,
                            UserId = null, // Se asignará cuando se cree el usuario
                            Price = (int)pricePerUser,
                            Pay = DateTime.UtcNow,
                            Expiration = DateTime.UtcNow.AddYears(1)
                        };
                        await _context.AddUsers.AddAsync(addUser);
                    }

                    paymentRecord.ProcessedAt = DateTime.UtcNow;
                }

                _context.Payments.Update(paymentRecord);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log del error pero no lanzar excepción para no afectar al webhook
                Console.WriteLine($"Error procesando webhook: {ex.Message}");
            }
        }
    }
}
