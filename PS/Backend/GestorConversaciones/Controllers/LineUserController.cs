using GestorConversaciones.DTO.Request.LineUser;
using GestorConversaciones.Services.Interface;
using Login.Routes;
using Microsoft.AspNetCore.Mvc;

namespace GestorConversaciones.Controllers
{
    public class LineUserController : Controller
    {
        private readonly ILineUserService _lineUserService;

        public LineUserController(ILineUserService lineUserService)
        {
            _lineUserService = lineUserService;
        }

        [HttpPost(ApiRoutes.LineUser.Add)]
        public async Task<IActionResult> AddLineUser([FromBody] NewLineUser add)
        {
            try
            {
                var result = await _lineUserService.AddLineUser(add);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut(ApiRoutes.LineUser.Delete)]
        public async Task<IActionResult> DeleteLineUser([FromBody] NewLineUser add)
        {
            try
            {
                await _lineUserService.DeleteLineUser(add);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
