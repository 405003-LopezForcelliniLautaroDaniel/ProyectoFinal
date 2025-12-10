using GestorConversaciones.DTO.Request.User;
using GestorConversaciones.Services.Interface;
using Login.Routes;
using Microsoft.AspNetCore.Mvc;

namespace GestorConversaciones.Controllers
{
    public class UserController : Controller
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }
        [HttpPost(ApiRoutes.User.NewUser)]
        public async Task<IActionResult> NewUser([FromBody] NewUserDto user)
        {
            try
            {
                var result = await _userService.NewUser(user);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet(ApiRoutes.User.GetAllUser)]
        public async Task<IActionResult> GetAllUser()
        {
            try
            {
                var result = await _userService.GetAllUser();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete(ApiRoutes.User.DeleteUser)]
        public async Task<IActionResult> DeleteUser([FromRoute] Guid id)
        {
            try
            {
                await _userService.DeleteUser(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut(ApiRoutes.User.PutUser)]
        public async Task<IActionResult> PutUser([FromBody] UpdateUserDto user)
        {
            try
            {
                var userUpdate = await _userService.PutUser(user);
                return Ok(userUpdate);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
