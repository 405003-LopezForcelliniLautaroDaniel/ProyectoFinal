using System.ComponentModel.DataAnnotations;

namespace Login.DTO.Request.User
{
    public class LoginDto
    {
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        public LoginDto()
        {
            this.UserName = string.Empty;
            this.Password = string.Empty;
        }
    }
}
