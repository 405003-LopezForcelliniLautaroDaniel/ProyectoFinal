using GestorConversaciones.DTO.Result.Dashboard;
using GestorConversaciones.Helper;
using GestorConversaciones.Services.Interface;
using Login.DataBase;
using Microsoft.EntityFrameworkCore;

namespace GestorConversaciones.Services.Service
{
    public class DashboardService : IDashboardService
    {
        private readonly Context _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DashboardService(Context context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<DashboardChatResult> DashboardChat()
        {
            try
            {
                var idCompany = _httpContextAccessor.HttpContext.GetIdCompany();

                var startDate = DateTime.UtcNow.Date.AddDays(-6);
                var endDate = DateTime.UtcNow.Date.AddDays(1); 

                var chats = await _context.Chats
                    .Where(c => c.IdCompany == idCompany &&
                                c.CreatedAt >= startDate &&
                                c.CreatedAt < endDate)
                    .ToListAsync();

                var chatsByDate = chats
                    .GroupBy(c => c.CreatedAt.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        Count = g.Count()
                    })
                    .ToDictionary(x => x.Date, x => x.Count);

                var days = new List<string>();
                var totals = new List<int>();

                for (int i = 6; i >= 0; i--)
                {
                    var date = DateTime.UtcNow.Date.AddDays(-i);
                    var dateString = date.ToString("yyyy-MM-dd"); 
                    
                    days.Add(dateString);
                    totals.Add(chatsByDate.ContainsKey(date) ? chatsByDate[date] : 0);
                }

                return new DashboardChatResult
                {
                    Day = days,
                    Total = totals
                };
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los datos", ex);
            }
        }

        public async Task<DashboardChatForLineResult> DashboardChatForLine()
        {
            try
            {
                var idCompany = _httpContextAccessor.HttpContext.GetIdCompany();

                var startDate = DateTime.UtcNow.Date.AddDays(-6);
                var endDate = DateTime.UtcNow.Date.AddDays(1);

                var chats = await _context.Chats
                    .Include(c => c.Line)
                    .Where(c => c.IdCompany == idCompany &&
                                c.CreatedAt >= startDate &&
                                c.CreatedAt < endDate)
                    .ToListAsync();

                // Agrupar por nombre de la línea
                var grouped = chats
                    .GroupBy(c => c.Line?.Name ?? "Sin línea")
                    .Select(g => new
                    {
                        LineName = g.Key,
                        Total = g.Count()
                    })
                    .ToList();

                return new DashboardChatForLineResult
                {
                    Line = grouped.Select(x => x.LineName).ToList(),
                    Total = grouped.Select(x => x.Total).ToList()
                };
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los datos", ex);
            }
        }
        public async Task<DashboardNoteResult> DashboardNotes()
        {
            try
            {
                var idCompany = _httpContextAccessor.HttpContext.GetIdCompany();

                var startDate = DateTime.UtcNow.Date.AddDays(-6);
                var endDate = DateTime.UtcNow.Date.AddDays(1);

                // Obtener notes
                var notes = await _context.Calendars
                    .Where(c => c.IdCompany == idCompany &&
                                c.Time >= startDate &&
                                c.Time < endDate)
                    .ToListAsync();


                return new DashboardNoteResult
                {
                    Note = notes.Where(n => n.IdClient == null).Count(),
                    NoteForClient = notes.Where(n => n.IdClient != null).Count()
                };
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los datos", ex);
            }
        }
        public async Task<DashboardChatForUserResult> DashboardChatForUsers()
        {
            try
            {
                var idCompany = _httpContextAccessor.HttpContext.GetIdCompany();

                var startDate = DateTime.UtcNow.Date.AddDays(-6); 
                var endDate = DateTime.UtcNow.Date.AddDays(1); 

                var chatsWithUsers = await _context.Chats
                    .Where(c => c.IdCompany == idCompany &&
                                c.CreatedAt >= startDate &&
                                c.CreatedAt < endDate &&
                                c.IdUser != null)
                    .ToListAsync();

                var grouped = chatsWithUsers
                    .GroupBy(c => c.IdUser!.Value)
                    .Select(g => new
                    {
                        IdUser = g.Key,
                        Total = g.Count()
                    })
                    .ToList();

                var userIds = grouped.Select(x => x.IdUser).ToList();
                var usersList = await _context.Users
                    .Where(u => userIds.Contains(u.Id))
                    .ToListAsync();
                var users = usersList.ToDictionary(u => u.Id, u => $"{u.FirstName} {u.LastName}".Trim());

                var result = grouped
                    .Select(g => new
                    {
                        UserName = users.ContainsKey(g.IdUser) 
                            ? users[g.IdUser] 
                            : "Usuario desconocido",
                        Total = g.Total
                    })
                    .OrderByDescending(x => x.Total)
                    .ToList();

                return new DashboardChatForUserResult
                {
                    User = result.Select(x => x.UserName).ToList(),
                    Total = result.Select(x => x.Total).ToList()
                };
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los datos", ex);
            }
        }

        public async Task<DashboardChatTakenResult> DashboardChatTaken()
        {
            try
            {
                var idCompany = _httpContextAccessor.HttpContext.GetIdCompany();

                var chatsTaken = await _context.Chats
                    .Where(c => c.IdCompany == idCompany &&
                                c.Status == "taken" &&
                                c.IdUser != null)
                    .ToListAsync();

                var grouped = chatsTaken
                    .GroupBy(c => c.IdUser!.Value)
                    .Select(g => new
                    {
                        IdUser = g.Key,
                        Total = g.Count()
                    })
                    .ToList();

                var userIds = grouped.Select(x => x.IdUser).ToList();
                var usersList = await _context.Users
                    .Where(u => userIds.Contains(u.Id))
                    .ToListAsync();
                var users = usersList.ToDictionary(u => u.Id, u => $"{u.FirstName} {u.LastName}".Trim());

                var result = grouped
                    .Select(g => new
                    {
                        UserName = users.ContainsKey(g.IdUser) 
                            ? users[g.IdUser] 
                            : "Usuario desconocido",
                        Total = g.Total
                    })
                    .OrderByDescending(x => x.Total)
                    .ToList();

                return new DashboardChatTakenResult
                {
                    User = result.Select(x => x.UserName).ToList(),
                    Total = result.Select(x => x.Total).ToList()
                };
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los datos", ex);
            }
        }

        public async Task<DashboardChatNewResult> DashboardChatNew()
        {
            try
            {
                var idCompany = _httpContextAccessor.HttpContext.GetIdCompany();

                var startDate = DateTime.UtcNow.Date.AddDays(-6); 
                var endDate = DateTime.UtcNow.Date.AddDays(1); 

                var allChats = await _context.Chats
                    .Where(c => c.IdCompany == idCompany)
                    .ToListAsync();

                var firstChatsByClient = allChats
                    .GroupBy(c => c.IdClient)
                    .Select(g => g.OrderBy(c => c.CreatedAt).First())
                    .ToList();

                var newChats = firstChatsByClient
                    .Where(c => c.CreatedAt >= startDate && c.CreatedAt < endDate)
                    .ToList();

                var chatsByDate = newChats
                    .GroupBy(c => c.CreatedAt.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        Count = g.Count()
                    })
                    .ToDictionary(x => x.Date, x => x.Count);

                var days = new List<string>();
                var totals = new List<int>();

                for (int i = 6; i >= 0; i--)
                {
                    var date = DateTime.UtcNow.Date.AddDays(-i);
                    var dateString = date.ToString("yyyy-MM-dd"); 
                    
                    days.Add(dateString);
                    totals.Add(chatsByDate.ContainsKey(date) ? chatsByDate[date] : 0);
                }

                return new DashboardChatNewResult
                {
                    Day = days,
                    Total = totals
                };
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los datos", ex);
            }
        }

        public async Task<DashboardChatOpenPercentageResult> DashboardChatOpenPercentage()
        {
            try
            {
                var idCompany = _httpContextAccessor.HttpContext.GetIdCompany();
                var idUser = _httpContextAccessor.HttpContext.GetIdUser();

                var userOpenChats = await _context.Chats
                    .Where(c => c.IdCompany == idCompany &&
                                c.Status != "archived" &&
                                c.IdUser == idUser)
                    .CountAsync();

                var totalOpenChats = await _context.Chats
                    .Where(c => c.IdCompany == idCompany &&
                                c.Status != "archived")
                    .CountAsync();

                double percentage = 0;
                if (totalOpenChats > 0)
                {
                    percentage = (double)userOpenChats / totalOpenChats * 100;
                }

                return new DashboardChatOpenPercentageResult
                {
                    Percentage = Math.Round(percentage, 2)
                };
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los datos", ex);
            }
        }

    }
}
