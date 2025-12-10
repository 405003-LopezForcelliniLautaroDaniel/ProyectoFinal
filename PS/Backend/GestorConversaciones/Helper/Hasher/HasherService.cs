namespace Login.Helper.Hasher
{
    public class HasherService
    {
        //BCrypt para hashear
        public async Task<string> Hasher(string password)
        {
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
            return hashedPassword;
        }
        public async Task<bool> Verify(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }
    }
}
