using GestorConversaciones.Models;
using Login.Models;
using Microsoft.EntityFrameworkCore;

namespace Login.DataBase
{
    public class Context : DbContext
    {
        public Context(DbContextOptions<Context> options) : base(options)
        { }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<Line> Lines { get; set; }
        public DbSet<LineUser> LineUsers { get; set; }
        public DbSet<Channel> Channels { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Chat> Chats { get; set; }
        public DbSet<MessageType> MessagesTypes { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Calendar> Calendars { get; set; }
        public DbSet<AddUser> AddUsers { get; set; }
        public DbSet<Payment> Payments { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Company>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.ToTable("company");
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();

                entity.Property(e => e.FirstName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.LastName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.UserName)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Password)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.IdCompany)
                    .IsRequired();

                entity.HasOne(e => e.Company)
                    .WithMany()
                    .HasForeignKey(e => e.IdCompany)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.Rol)
                    .IsRequired();

                entity.Property(e => e.Status)
                    .IsRequired();



                entity.HasIndex(e => e.UserName).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.IdCompany);

                entity.ToTable("user");
            });

            modelBuilder.Entity<Line>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.IdCompany)
                    .IsRequired();

                entity.HasOne(e => e.Company)
                    .WithMany()
                    .HasForeignKey(e => e.IdCompany)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.IdCompany);

                entity.Property(e => e.Status)
                    .IsRequired();

                entity.Property(e => e.Description)
                    .HasMaxLength(255);

                entity.ToTable("line");
            });

            modelBuilder.Entity<LineUser>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();


                entity.Property(e => e.IdLine)
                    .IsRequired();

                entity.HasOne(e => e.Line)
                    .WithMany()
                    .HasForeignKey(e => e.IdLine)
                    .OnDelete(DeleteBehavior.Restrict);


                entity.Property(e => e.IdUser)
                    .IsRequired();

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.IdUser)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.Status)
                    .IsRequired();


                entity.HasIndex(e => e.IdUser);
                entity.HasIndex(e => e.IdLine);

                entity.ToTable("line_user");
            });

            modelBuilder.Entity<Channel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Contact)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.IdCompany)
                    .IsRequired();

                entity.HasOne(e => e.Company)
                    .WithMany()
                    .HasForeignKey(e => e.IdCompany)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.IdCompany);

                entity.Property(e => e.ObjectId)
                    .IsRequired()
                    .HasColumnType("bigint");

                entity.ToTable("channel");
            });
            modelBuilder.Entity<Client>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Contact)
                    .IsRequired()
                    .HasMaxLength(100);


                entity.Property(e => e.IdCompany)
                    .IsRequired();

                entity.HasOne(e => e.Company)
                    .WithMany()
                    .HasForeignKey(e => e.IdCompany)
                    .OnDelete(DeleteBehavior.Restrict);


                entity.Property(e => e.Status)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.HasIndex(e => e.IdCompany);

                entity.ToTable("client");
            });
            modelBuilder.Entity<Chat>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();



                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.IdUser)
                    .OnDelete(DeleteBehavior.Restrict);

                // IdChannel (requerido)
                entity.Property(e => e.IdChannel)
                    .IsRequired();

                entity.HasOne(e => e.Channel)
                    .WithMany()
                    .HasForeignKey(e => e.IdChannel)
                    .OnDelete(DeleteBehavior.Restrict);

                // IdClient (requerido)
                entity.Property(e => e.IdClient)
                    .IsRequired();

                entity.HasOne(e => e.Client)
                    .WithMany()
                    .HasForeignKey(e => e.IdClient)
                    .OnDelete(DeleteBehavior.Restrict);

                // IdClient (requerido)
                entity.Property(e => e.IdLine);

                entity.HasOne(e => e.Line)
                    .WithMany()
                    .HasForeignKey(e => e.IdLine)
                    .OnDelete(DeleteBehavior.Restrict);

                // IdCompany (opcional)
                entity.Property(e => e.IdCompany)
                    .IsRequired(true);

                entity.HasOne(e => e.Company)
                    .WithMany()
                    .HasForeignKey(e => e.IdCompany)
                    .OnDelete(DeleteBehavior.Restrict);

                // Status
                entity.Property(e => e.Status)
                    .HasMaxLength(100);

                entity.Property(e => e.CreatedAt)
            .HasColumnType("datetime")
            .HasDefaultValueSql("GETUTCDATE()");

                entity.ToTable("chat");
            });


            modelBuilder.Entity<MessageType>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .ValueGeneratedOnAdd()
                    .HasColumnType("int");

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.ToTable("messagetype");
            });

            modelBuilder.Entity<Message>(entity =>
            {

                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();


                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.IdUser)
                    .OnDelete(DeleteBehavior.Restrict);


                entity.HasOne(e => e.Client)
                    .WithMany()
                    .HasForeignKey(e => e.IdClient)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.IdChat)
                    .IsRequired();

                entity.HasOne(e => e.Chat)
                    .WithMany()
                    .HasForeignKey(e => e.IdChat)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.IdMessageType)
                    .IsRequired();

                entity.HasOne(e => e.MessageType)
                    .WithMany()
                    .HasForeignKey(e => e.IdMessageType)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.Content)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Time)
                    .IsRequired()
                    .HasColumnType("datetime");

                entity.ToTable("message");
            });

            modelBuilder.Entity<Calendar>(entity =>
            {

                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();

                entity.Property(e => e.Description)
                    .HasColumnType("text")
                    .IsRequired(false);

                entity.Property(e => e.Time)
                    .IsRequired();

                entity.Property(e => e.IdCompany)
                    .IsRequired();

                entity.Property(e => e.IdUser);

                entity.Property(e => e.IdClient);

                entity.HasOne(e => e.Company)
                    .WithMany()
                    .HasForeignKey(e => e.IdCompany)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Client)
                    .WithMany()
                    .HasForeignKey(e => e.IdClient)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.IdUser)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.IdCompany);
                entity.HasIndex(e => e.IdClient);
                entity.HasIndex(e => e.IdUser);

                entity.ToTable("calendar");
            });

            modelBuilder.Entity<AddUser>(entity =>
                {
                    entity.HasKey(e => e.Id);
                    entity.Property(e => e.Id).ValueGeneratedOnAdd();

                    entity.Property(e => e.Pay)
                        .IsRequired();

                    entity.Property(e => e.Expiration)
                        .IsRequired();

                    entity.Property(e => e.UserId)
                        .IsRequired(false); // Nullable - se asigna cuando se crea el usuario

                    entity.Property(e => e.Price)
                        .IsRequired();

                    entity.Property(e => e.IdCompany)
                        .IsRequired();
                    
                    entity.HasOne(e => e.Company)
                        .WithMany()
                        .HasForeignKey(e => e.IdCompany)
                        .OnDelete(DeleteBehavior.Restrict);

                    // Relación opcional con User (permite null)
                    entity.HasOne(e => e.User)
                        .WithMany()
                        .HasForeignKey(e => e.UserId)
                        .OnDelete(DeleteBehavior.SetNull)
                        .IsRequired(false);

                    entity.HasIndex(e => e.IdCompany);
                    entity.HasIndex(e => e.UserId);

                    entity.ToTable("adduser");
                });

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();

                entity.Property(e => e.MercadoPagoId)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.UserId)
                    .IsRequired();

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.CompanyId)
                    .IsRequired();

                entity.HasOne(e => e.Company)
                    .WithMany()
                    .HasForeignKey(e => e.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.Quantity)
                    .IsRequired();

                entity.Property(e => e.Amount)
                    .IsRequired()
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Status)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.Property(e => e.ExternalReference)
                    .HasMaxLength(100);

                entity.Property(e => e.CreatedAt)
                    .IsRequired()
                    .HasColumnType("datetime");

                entity.Property(e => e.ProcessedAt)
                    .HasColumnType("datetime");

                entity.Property(e => e.CancelledAt)
                    .HasColumnType("datetime");

                entity.HasIndex(e => e.MercadoPagoId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.CompanyId);
                entity.HasIndex(e => e.Status);

                entity.ToTable("payment");
            });
        }
    }
}
