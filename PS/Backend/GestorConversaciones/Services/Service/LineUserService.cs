using GestorConversaciones.DTO.Request.LineUser;
using GestorConversaciones.Models;
using GestorConversaciones.Services.Interface;
using Login.DataBase;
using Microsoft.EntityFrameworkCore;
using static Login.Routes.ApiRoutes;

namespace GestorConversaciones.Services.Service
{
    public class LineUserService : ILineUserService
    {
        private readonly Context _context;
        public LineUserService(Context context)
        {
            _context = context;
        }
        public async Task<Models.LineUser> AddLineUser(NewLineUser add)
        {
            try
            {
                var result = await _context.LineUsers
                    .Where(l => l.IdLine == add.IdLine && l.IdUser == add.IdUser)
                    .FirstOrDefaultAsync();
                if (result == null)
                {
                    Models.LineUser lineUser = new Models.LineUser
                    {
                        IdLine = add.IdLine,
                        IdUser = add.IdUser,
                        Status = true
                    };

                    await _context.LineUsers.AddAsync(lineUser);
                    await _context.SaveChangesAsync();

                    return lineUser;
                }
                else
                {
                    result.Status = true;

                    await _context.SaveChangesAsync();
                    return result;
                }

            }
            catch (Exception ex)
            {
                throw new Exception("Error al agregar usuario a line", ex);
            }
        }

        public async Task DeleteLineUser(NewLineUser delete)
        {
            try
            {
                var result = await _context.LineUsers
                    .Where(l => l.IdLine == delete.IdLine && l.IdUser == delete.IdUser)
                    .FirstOrDefaultAsync();

                result.Status = false;
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Error al dar de baja", ex);
            }
        }
    }
}
