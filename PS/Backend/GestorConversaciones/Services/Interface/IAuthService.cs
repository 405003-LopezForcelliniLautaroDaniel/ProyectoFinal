using Login.DTO.Request.User;
using Login.DTO.Result;
using Login.DTO.Result.User;

namespace Login.Services.Interface
{
    public interface IAuthService
    {
        Task<UserLogin> Register(NewUserRegisterDto register);
        Task<UserLogin> Login(LoginDto login);
    }
}
