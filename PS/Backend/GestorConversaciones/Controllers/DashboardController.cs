using GestorConversaciones.Services.Interface;
using Login.Routes;
using Microsoft.AspNetCore.Mvc;

namespace GestorConversaciones.Controllers
{
    public class DashboardController : Controller
    {
        private readonly IDashboardService _dashboardService;
        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        //DASHBOARD PARA ADMIN
        [HttpGet(ApiRoutes.Dashboard.Chats)]
        public async Task<IActionResult> DashboardChat()
        {
            try
            {
                var result = await _dashboardService.DashboardChat();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet(ApiRoutes.Dashboard.ChatsForLine)]
        public async Task<IActionResult> DashboardChatForLine()
        {
            try
            {
                var result = await _dashboardService.DashboardChatForLine();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet(ApiRoutes.Dashboard.Notes)]
        public async Task<IActionResult> DashboardNotes()
        {
            try
            {
                var result = await _dashboardService.DashboardNotes();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet(ApiRoutes.Dashboard.ChatForUsers)]
        public async Task<IActionResult> DashboardChatForUsers()
        {
            try
            {
                var result = await _dashboardService.DashboardChatForUsers();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet(ApiRoutes.Dashboard.ChatTaken)]
        public async Task<IActionResult> DashboardChatTaken()
        {
            try
            {
                var result = await _dashboardService.DashboardChatTaken();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet(ApiRoutes.Dashboard.ChatNew)]
        public async Task<IActionResult> DashboardChatNew()
        {
            try
            {
                var result = await _dashboardService.DashboardChatNew();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        //PARA USERS
        [HttpGet(ApiRoutes.Dashboard.ChatOpenPercentage)]
        public async Task<IActionResult> DashboardChatOpenPercentage()
        {
            try
            {
                var result = await _dashboardService.DashboardChatOpenPercentage();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
