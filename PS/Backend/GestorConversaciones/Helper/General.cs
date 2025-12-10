namespace GestorConversaciones.Helper
{
    public static class General
    {
        public static Guid GetIdCompany(this HttpContext httpContext)
        {
            var claimValue = httpContext.User.Claims
                .SingleOrDefault(x => x.Type == "idCompany")
                ?.Value;

            return Guid.TryParse(claimValue, out Guid result) ? result : Guid.Empty;
        }
        public static Guid GetIdUser(this HttpContext httpContext)
        {
            var claimValue = httpContext.User.Claims
                .SingleOrDefault(x => x.Type == "id")
                ?.Value;

            return Guid.TryParse(claimValue, out Guid result) ? result : Guid.Empty;
        }
    }
}
