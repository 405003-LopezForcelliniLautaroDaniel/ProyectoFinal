using GestorConversaciones.DTO.Request.LineUser;
using GestorConversaciones.Models;

namespace GestorConversaciones.Services.Interface
{
    public interface ILineUserService
    {
        Task<LineUser> AddLineUser(NewLineUser add);
        Task DeleteLineUser(NewLineUser add);
    }
}
