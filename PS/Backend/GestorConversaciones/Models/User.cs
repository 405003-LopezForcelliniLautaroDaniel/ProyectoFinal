using GestorConversaciones.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace Login.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public Guid IdCompany { get; set; }
        public Company Company { get; set; }
        public bool Rol {  get; set; }
        public bool Status { get; set; }

        public User()
        {
            this.FirstName = string.Empty;
            this.LastName = string.Empty;
            this.UserName = string.Empty;
            this.Password = string.Empty;
            this.Email = string.Empty;
        }
    }
}
