using GestorConversaciones.DTO.Request.Line;
using GestorConversaciones.Services.Interface;
using Login.Routes;
using Microsoft.AspNetCore.Mvc;

namespace GestorConversaciones.Controllers
{
    public class LineController : Controller
    {

        private readonly ILineService _lineService;
        public LineController(ILineService lineService)
        {
            _lineService = lineService;
        }
        [HttpPost(ApiRoutes.Line.Add)]
        public async Task<IActionResult> AddLine([FromBody] NewLineDto line)
        {
            try
            {
                var result = await _lineService.AddLine(line);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet(ApiRoutes.Line.GetAllLine)]
        public async Task<IActionResult> GetAllLine()
        {
            try
            {
                var result = await _lineService.GetAllLine();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut(ApiRoutes.Line.Update)]
        public async Task<IActionResult> UpdateLine([FromBody] UpdateLineDeto line)
        {
            try
            {
                var result = await _lineService.UpdateLine(line);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut(ApiRoutes.Line.Delete)]
        public async Task<IActionResult> DeleteLine([FromRoute]Guid id)
        {
            try
            {
                await _lineService.DeleteLine(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
