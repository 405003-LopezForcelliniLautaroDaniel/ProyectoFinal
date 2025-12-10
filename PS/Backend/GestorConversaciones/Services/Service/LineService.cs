using GestorConversaciones.DTO.Request.Line;
using GestorConversaciones.DTO.Result.User;
using GestorConversaciones.Helper;
using GestorConversaciones.Models;
using GestorConversaciones.Services.Interface;
using Login.DataBase;
using Microsoft.EntityFrameworkCore;
using static Login.Routes.ApiRoutes;

namespace GestorConversaciones.Services.Service
{
    public class LineService : ILineService
    {
        private readonly Context _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public LineService(Context context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<Models.Line> AddLine(NewLineDto line)
        {
            try
            {
                var idCompany = _httpContextAccessor.HttpContext.GetIdCompany();
                Models.Line lineAdd = new Models.Line
                {
                    Name = line.Name,
                    IdCompany = idCompany,
                    Status = true,
                    Description = line.Description
                };
                await _context.Lines.AddAsync(lineAdd);
                await _context.SaveChangesAsync();

                return lineAdd;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al agregar fila", ex);
            }
        }

        public async Task DeleteLine(Guid id)
        {
            try
            {
                var line = await _context.Lines.FirstOrDefaultAsync(l => l.Id == id);

                if (line == null)
                {
                    throw new KeyNotFoundException($"No se encontró la línea con Id {id}.");
                }

                //VERIFICAR SI HAY USUARIOS EN ESA FILA Y HACER BAJA LOGICA DE ESA FILA PARA ESE USUARIO
                await DeleteUserLine(id);

                line.Status = false;

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Error al eliminar la línea", ex);
            }
        }


        public async Task<List<Models.Line>> GetAllLine()
        {
            try
            {
                var idCompany = _httpContextAccessor.HttpContext.GetIdCompany();

                var listLine = await _context.Lines
                    .Where(u => u.IdCompany == idCompany && u.Status == true)
                    .Select(u => new Models.Line
                    {
                        Id = u.Id,
                        Name = u.Name,
                        IdCompany = u.IdCompany,
                        Company = u.Company,
                        Description = u.Description,
                    })
                    .ToListAsync();

                return listLine;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener Lines", ex);
            }
        }
        public async Task<List<Models.Line>> GetAllLine(Guid idCompany)
        {
            try
            {

                var listLine = await _context.Lines
                    .Where(u => u.IdCompany == idCompany && u.Status == true)
                    .Select(u => new Models.Line
                    {
                        Id = u.Id,
                        Name = u.Name,
                        IdCompany = u.IdCompany,
                        Company = u.Company,
                        Description = u.Description,
                    })
                    .ToListAsync();

                return listLine;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener Lines", ex);
            }
        }
        public async Task<Models.Line> UpdateLine(UpdateLineDeto line)
        {
            var result = await _context.Lines.FirstOrDefaultAsync(l => l.Id == line.Id);
            result.Name = line.Name;
            result.Description = line.Description;
            await _context.SaveChangesAsync();

            return result;
        }

        public async Task DeleteUserLine(Guid lineId)
        {
            try
            {
                var lineUsers = await _context.LineUsers
                    .Where(l => l.IdLine == lineId)
                    .ToListAsync();

                if (!lineUsers.Any())
                {
                    return;

                }

                foreach (var lu in lineUsers)
                {
                    lu.Status = false;
                }
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Error al dar baja logica user", ex);
            }
        }
    }
}
