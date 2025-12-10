using GestorConversaciones.Models;
using Login.Models;

namespace Login.DTO.Result.User
{
    public class UserLogin : BaseResult
    {
        public Login.Models.User User { get; set; }
        public string Token { get; set; }
        public List<Line> Line {  get; set; }
    }
}
