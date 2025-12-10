using GestorConversaciones.Models;

namespace GestorConversaciones.DTO.Result.User
{


    public class GetUserList
    {
        public List<UserListResult> User { get; set; }
        public int Available { get; set; }
        

    }
    public class UserListResult
    {
        public UserAll User { get; set; }
        public List<LineResult> Lines { get; set; }
    }



    public class UserAll
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
    public class LineResult
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
    }
    

}

