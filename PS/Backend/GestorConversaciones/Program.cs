using GestorConversaciones.Apis.Telegram.Service.Interface;
using GestorConversaciones.Apis.Telegram.Service.Services;
using GestorConversaciones.Apis.Telegram;
using GestorConversaciones.Services.Interface;
using GestorConversaciones.Services.Service;
using Login.DataBase;
using Login.Helper.Hasher;
using Login.Services.Interface;
using Login.Services.Service;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using GestorConversaciones.Helper.Hubs;
using Microsoft.AspNetCore.SignalR;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSignalR();
builder.Services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ILineService, LineService>();
builder.Services.AddScoped<ILineUserService, LineUserService>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IPayService, PayService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<HasherService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ISaveDb, SaveDb>();
builder.Services.AddSingleton<TelegramHelper>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<TelegramHelper>());
builder.Services.AddScoped<ITelegramService, TelegramService>();
builder.Services.AddScoped<ICalendarService, CalendarService>();

builder.Services.AddDbContext<Context>(options =>
{
    options.UseMySql(builder.Configuration.GetConnectionString("ConectionDataBase"), ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("ConectionDataBase")));
});

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
        
        options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chathub"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();





var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAllOrigins");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/chathub"); 
app.Run();
