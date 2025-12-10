using Login.DTO.Request.User;
using Login.DTO.Result;
using Login.Routes;
using Login.Services.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Internal;

namespace GestorConversaciones.Controllers
{
    public class RegisterController : Controller
    {
        private readonly IAuthService _registerService;

        public RegisterController(IAuthService registerService)
        {
            _registerService = registerService;
        }

        [HttpPost(ApiRoutes.Register.RegisterUser)]
        public async Task<BaseResult> RegisterUser([FromBody] NewUserRegisterDto register)
        {
            try
            {
                var result = await _registerService.Register(register);
                return result;
            }
            catch (Exception ex)
            {
                return new BaseResult();
            }
        }
    }
}
