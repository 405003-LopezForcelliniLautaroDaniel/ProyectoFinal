
using GestorConversaciones.DTO.Request.User;
using GestorConversaciones.DTO.Result.User;

namespace GestorConversaciones.Services.Interface
{
    public interface IUserService
    {
        Task DeleteUser(Guid id);
        Task<GetUserList> GetAllUser();
        Task<UserResult> NewUser(NewUserDto user);
        Task<UserResult> PutUser(UpdateUserDto user);
    }
}
