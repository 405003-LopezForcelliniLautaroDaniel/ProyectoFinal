using GestorConversaciones.Models;
using Login.DataBase;
using Login.DTO.Request.User;
using Login.DTO.Result.User;
using Login.Helper.Hasher;
using Login.Models;
using Login.Services.Interface;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Net;

namespace Login.Services.Service
{
    public class AuthService : IAuthService
    {
        private readonly Context _context;
        private readonly TokenService _tokenService;
        private readonly HasherService _hasherService;
        public AuthService(Context context, TokenService tokenService, HasherService hasherService)
        {
            _context = context;
            _tokenService = tokenService;
            _hasherService = hasherService;
        }
        public async Task<UserLogin> Register(NewUserRegisterDto register)
        {
            var result = new UserLogin();

            var validations = new Dictionary<string, string>
    {
        { register.FirstName, "El primer nombre está llegando vacío" },
        { register.LastName, "El apellido está llegando vacío" },
        { register.UserName, "El nombre de usuario está llegando vacío" },
        { register.Password, "La contraseña está llegando vacía" },
        { register.Email, "El mail está llegando vacío" }
    };

            foreach (var item in validations)
            {
                if (string.IsNullOrWhiteSpace(item.Key))
                {
                    result.SetError(item.Value, HttpStatusCode.BadRequest);
                    return result;
                }
            }

            register.Password = await _hasherService.Hasher(register.Password);

            var userModel = new User
            {
                FirstName = register.FirstName,
                LastName = register.LastName,
                UserName = register.UserName,
                Password = register.Password,
                Email = register.Email,
                IdCompany = register.IdCompany,
            };
            await _context.AddAsync(userModel);
            await _context.SaveChangesAsync();

            result.User = userModel;
            return result;
        }
        public async Task<UserLogin> Login(LoginDto login)
        {
            var result = new UserLogin();

            try
            {
                // Validar campos requeridos
                if (string.IsNullOrWhiteSpace(login.UserName))
                {
                    result.SetError("El nombre de usuario llega vacío.", HttpStatusCode.BadRequest);
                    return result;
                }

                if (string.IsNullOrWhiteSpace(login.Password))
                {
                    result.SetError("La contraseña está llegando vacía.", HttpStatusCode.BadRequest);
                    return result;
                }

                var user = await _context.Users
                    .Where(u => u.UserName == login.UserName)
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    result.SetError("Usuario no encontrado", HttpStatusCode.NotFound);
                    return result;
                }

                bool isValid = await _hasherService.Verify(login.Password, user.Password);

                if (!isValid)
                {
                    result.SetError("Contraseña incorrecta", HttpStatusCode.Unauthorized);
                    return result;
                }

                // Verificar si el usuario tiene un registro en AddUser
                var userAddUserRecord = await _context.AddUsers
                    .Where(au => au.UserId == user.Id)
                    .OrderByDescending(au => au.Pay) // Obtener el registro más reciente
                    .FirstOrDefaultAsync();

                // Si tiene registro en AddUser, verificar que no hayan pasado más de 30 días
                if (userAddUserRecord != null)
                {
                    var daysSinceLastPayment = (DateTime.UtcNow - userAddUserRecord.Pay).Days;
                    
                    if (daysSinceLastPayment > 30)
                    {
                        result.SetError("Tu suscripción ha expirado. Han pasado más de 30 días desde el último pago.", HttpStatusCode.Forbidden);
                        return result;
                    }
                }
                // Si no tiene registro en AddUser, es un usuario de los 5 base (permitir login normal)

                var lines = await _context.Lines
                    .Where(l => _context.LineUsers
                        .Where(lu => lu.IdUser == user.Id && lu.Status == true)
                        .Select(lu => lu.IdLine)
                        .Contains(l.Id))
                    .ToListAsync();



                string token = _tokenService.GenerateToken(user);

                result.User = user;
                result.Token = token;
                result.Line = lines;
                return result;
            }
            catch (Exception ex)
            {
                result.SetError(ex.Message, HttpStatusCode.InternalServerError);
                return result;
            }
        }

    }
}
