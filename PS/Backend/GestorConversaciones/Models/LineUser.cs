using Login.Models;

namespace GestorConversaciones.Models
{
    public class LineUser
    {
        public Guid Id { get; set; }
        public Guid IdLine { get; set; }
        public Guid IdUser { get; set; }
        public bool Status { get; set; }
        public Line Line { get; set; }
        public User User { get; set; }
    }
}
