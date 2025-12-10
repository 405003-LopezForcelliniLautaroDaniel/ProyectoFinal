namespace Login.Routes
{
    public class ApiRoutes
    {
        public const string Root = "api";
        public const string Version = "v1";
        public const string Base = Root + "/" + Version;


        public static class Register
        {
            public const string RegisterUser = Base + "/register";
        }
        public static class Login
        {
            public const string LoginUser = Base + "/login";
        }
        public static class User
        {
            public const string NewUser = Base + "/newuser";
            public const string GetAllUser = Base + "/getalluser";
            public const string DeleteUser = Base + "/deleteuser/{id}";
            public const string PutUser = Base + "/updateuser";
        }
        public static class Line
        {
            public const string Add = Base + "/newline";
            public const string GetAllLine = Base + "/getallline";
            public const string Update = Base + "/updateline";
            public const string Delete = Base + "/deleteline/{id}";
        }

        public static class LineUser
        {
            public const string Add = Base + "/addlineuser";
            public const string Delete = Base + "/deletelineuser";
        }

        public static class Chat
        {
            public const string GetAllChat = Base + "/allchat";
            public const string GetChat = Base + "/chat/{id}";
            public const string SendMessage = Base + "/message";
            public const string Archived = Base + "/archived/{idChat}";
            public const string Transfer = Base + "/transfer";
        }
        public static class Calendar
        {
            public const string NewCalendar = Base + "/newCalendar";
            public const string GetCalendar = Base + "/getCalendar";
            public const string DeleteCalendar = Base + "/deleteCalendar/{id}";
            public const string EditCalendar = Base + "/editCalendar/{id}";
            public const string GetByIdClient = Base + "/getByIdClient/{idclient}";
        }
        public static class Pay
        {
            public const string Create = Base + "/payment/create";
            public const string Status = Base + "/payment/status/{paymentId}";
            public const string Cancel = Base + "/payment/cancel/{paymentId}";
            public const string Webhook = Base + "/payment/webhook";
        }

        public static class Dashboard
        {
            public const string Chats = Base + "/dashboardchat";
            public const string ChatsForLine = Base + "/dashboardchatforline";
            public const string Notes = Base + "/dashboardnotes";
            public const string ChatForUsers = Base + "/chatforuser";
            public const string ChatTaken = Base + "/dashboardchattaken";
            public const string ChatNew = Base + "/dashboardchatnew";
            public const string ChatOpenPercentage = Base + "/dashboardchatopenpercentage";
        }
    }
}
