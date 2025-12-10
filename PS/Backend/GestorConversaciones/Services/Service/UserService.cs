using GestorConversaciones.DTO.Request.User;
using GestorConversaciones.DTO.Result.User;
using GestorConversaciones.Helper;
using GestorConversaciones.Services.Interface;
using Login.DataBase;
using Login.Helper.Hasher;
using Microsoft.EntityFrameworkCore;

namespace GestorConversaciones.Services.Service
{
    public class UserService : IUserService
    {
        private readonly Context _context;
        private readonly HasherService _hasherService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public UserService(Context context, HasherService hasherService, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _hasherService = hasherService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task DeleteUser(Guid id)
        {
            try
            {
                var user = _context.Users.FirstOrDefault(x => x.Id == id);
                user.Status = false;

                await _context.SaveChangesAsync();

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GetUserList> GetAllUser()
        {
            try
            {
                var idCompany = _httpContextAccessor.HttpContext.GetIdCompany();
                var idUser = _httpContextAccessor.HttpContext.GetIdUser();

                // Lista de usuarios con sus líneas
                var listUser = await _context.Users
                    .Where(u => u.IdCompany == idCompany && u.Status == true && u.Rol == false && u.Id != idUser)
                    .Select(u => new UserListResult
                    {
                        User = new UserAll
                        {
                            Id = u.Id,
                            FirstName = u.FirstName,
                            LastName = u.LastName,
                            UserName = u.UserName,
                            Password = u.Password,
                            Email = u.Email,
                            IdCompany = u.IdCompany,
                            Company = u.Company,
                            Rol = u.Rol
                        },
                        Lines = _context.LineUsers
                            .Where(lu => lu.IdUser == u.Id && lu.Status == true)
                            .Join(
                                _context.Lines.Where(l => l.Status == true),
                                lu => lu.IdLine,
                                l => l.Id,
                                (lu, l) => new LineResult
                                {
                                    Id = l.Id,
                                    Name = l.Name
                                }
                            )
                            .ToList()
                    })
                    .ToListAsync();

                // Fecha actual
                var today = DateTime.UtcNow;

                // Contar slots comprados válidos (vigentes entre Pay y Expiration)
                var totalPurchasedSlots = await _context.AddUsers
                    .Where(u => u.IdCompany == idCompany &&
                                today >= u.Pay && today <= u.Expiration)
                    .CountAsync();

                // Total de usuarios activos
                var totalActiveUsers = await _context.Users
                    .Where(u => u.IdCompany == idCompany && u.Status == true)
                    .CountAsync();

                // Cálculo del disponible: (5 base + slots comprados) - usuarios activos
                int available = (5 + totalPurchasedSlots) - totalActiveUsers;

                // Retorno del objeto combinado
                return new GetUserList
                {
                    User = listUser,
                    Available = available
                };
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener usuarios", ex);
            }
        }



        public async Task<UserResult> NewUser(NewUserDto user)
        {
            var idCompany = _httpContextAccessor.HttpContext.GetIdCompany();
            await QuantityVerification(idCompany); // lanza excepción si no puede crear

            var password = await _hasherService.Hasher(user.Password);

            var userExist = await _context.Users
                .FirstOrDefaultAsync(u => u.UserName == user.UserName);

            if (userExist != null)
                throw new Exception("El nombre de usuario no está disponible");

            var newUser = new Login.Models.User
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserName = user.UserName,
                Email = user.Email,
                Password = password,
                IdCompany = idCompany,
                Rol = false,
                Status = true
            };

            await _context.Users.AddAsync(newUser);
            await _context.SaveChangesAsync();

            // Buscar un slot disponible y asignarlo al nuevo usuario
            var today = DateTime.UtcNow;
            var availableSlot = await _context.AddUsers
                .Where(au => au.IdCompany == idCompany &&
                             au.UserId == null &&
                             today >= au.Pay && today <= au.Expiration)
                .OrderBy(au => au.Expiration) // Asignar primero los que expiran más pronto
                .FirstOrDefaultAsync();

            // Si encontró un slot disponible, asignarlo
            if (availableSlot != null)
            {
                availableSlot.UserId = newUser.Id;
                _context.AddUsers.Update(availableSlot);
                await _context.SaveChangesAsync();
            }
            // Si no hay slot disponible, significa que está usando uno de los 5 base (no necesita registro en AddUser)

            return new UserResult
            {
                Id = newUser.Id,
                FirstName = newUser.FirstName,
                LastName = newUser.LastName,
                UserName = newUser.UserName,
                Password = newUser.Password,
                Email = newUser.Email,
                IdCompany = newUser.IdCompany,
                Company = newUser.Company,
                Rol = newUser.Rol
            };
        }



        public async Task QuantityVerification(Guid idCompany)
        {
            var today = DateTime.UtcNow;

            var totalPurchasedSlots = await _context.AddUsers
                .Where(u => u.IdCompany == idCompany &&
                            today >= u.Pay && today <= u.Expiration)
                .CountAsync();

            var totalActiveUsers = await _context.Users
                .Where(u => u.IdCompany == idCompany && u.Status == true)
                .CountAsync();

            if (totalActiveUsers >= (totalPurchasedSlots + 5))
                throw new Exception("El usuario no puede crear más cuentas");
        }




        public async Task<UserResult> PutUser(UpdateUserDto user)
        {
            try
            {
                var userExist = await _context.Users.FirstOrDefaultAsync(u => u.Id == user.Id);
                if (userExist == null)
                {
                    throw new Exception("Usuario no encontrado");
                }
                userExist.FirstName = user.FirstName;
                userExist.LastName = user.LastName;
                userExist.Email = user.Email;
                if (user.Password != null)
                {
                    userExist.Password = await _hasherService.Hasher(user.Password);
                }
                await _context.SaveChangesAsync();
                return new UserResult
                {
                    Id = userExist.Id,
                    FirstName = userExist.FirstName,
                    LastName = userExist.LastName,
                    UserName = userExist.UserName,
                    Password = userExist.Password,
                    Email = userExist.Email,
                    IdCompany = userExist.IdCompany,
                    Company = userExist.Company,
                    Rol = userExist.Rol
                };
            }
            catch (Exception ex)
            {
                throw new Exception("Error al editar este usuario", ex);
            }
        }
    }
}
