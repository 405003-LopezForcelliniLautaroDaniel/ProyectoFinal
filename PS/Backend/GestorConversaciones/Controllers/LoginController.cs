using Login.DTO.Request.User;
using Login.DTO.Result;
using Login.Routes;
using Login.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace GestorConversaciones.Controllers
{
    public class LoginController : Controller
    {
        private readonly IAuthService _loginService;
        public LoginController(IAuthService loginService)
        {
            _loginService = loginService;
        }

        [HttpPost(ApiRoutes.Login.LoginUser)]
        public async Task<BaseResult> Login([FromBody] LoginDto login)
        {
            try
            {
                var result = await _loginService.Login(login);
                return result;
            }
            catch (Exception ex)
            {
                return new BaseResult();
            }
        }
    }
}
