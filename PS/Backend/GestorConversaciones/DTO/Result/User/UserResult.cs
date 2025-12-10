using GestorConversaciones.Models;

namespace GestorConversaciones.DTO.Result.User
{
    public class UserResult
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public Guid IdCompany { get; set; }
        public Company Company { get; set; }
        public bool Rol { get; set; }
    }
}
