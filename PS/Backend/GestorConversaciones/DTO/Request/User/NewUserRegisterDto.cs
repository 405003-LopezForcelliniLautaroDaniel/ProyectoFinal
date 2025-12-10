namespace Login.DTO.Request.User
{
    public class NewUserRegisterDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public Guid IdCompany { get; set; }


        public NewUserRegisterDto()
        {
            this.FirstName = string.Empty;
            this.LastName = string.Empty;
            this.UserName = string.Empty;
            this.Password = string.Empty;
            this.Email = string.Empty;
        }
    }
}
