using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace GestorConversaciones.Helper.Hubs
{
    public class CustomUserIdProvider : IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext connection)
        {
            // Retorna el ID (GUID) del usuario desde el claim "id"
            return connection.User?.FindFirst("id")?.Value;
        }
    }
}

