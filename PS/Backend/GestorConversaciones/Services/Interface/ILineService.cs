using GestorConversaciones.DTO.Request.Line;
using GestorConversaciones.Models;

namespace GestorConversaciones.Services.Interface
{
    public interface ILineService
    {
        Task<Line> AddLine(NewLineDto line);
        Task<List<Line>> GetAllLine();
        Task<List<Line>> GetAllLine(Guid idCompany);
        Task<Line> UpdateLine(UpdateLineDeto line);
        Task DeleteLine(Guid id);
    }
}
