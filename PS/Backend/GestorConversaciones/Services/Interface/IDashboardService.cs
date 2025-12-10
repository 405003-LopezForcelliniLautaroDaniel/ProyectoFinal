using GestorConversaciones.DTO.Result.Dashboard;

namespace GestorConversaciones.Services.Interface
{
    public interface IDashboardService
    {
        Task<DashboardChatResult> DashboardChat();
        Task<DashboardChatForLineResult> DashboardChatForLine();
        Task<DashboardNoteResult> DashboardNotes();
        Task<DashboardChatForUserResult> DashboardChatForUsers();
        Task<DashboardChatTakenResult> DashboardChatTaken();
        Task<DashboardChatNewResult> DashboardChatNew();
        Task<DashboardChatOpenPercentageResult> DashboardChatOpenPercentage();
    }
}
