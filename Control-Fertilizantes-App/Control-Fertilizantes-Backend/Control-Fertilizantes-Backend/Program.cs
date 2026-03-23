using Control_Fertilizantes_Backend.DataAccess;
using Control_Fertilizantes_Backend.Interfaces;
using Control_Fertilizantes_Backend.Repositories;
using Control_Fertilizantes_Backend.Services;

var builder = WebApplication.CreateBuilder(args);

//  Servicios
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//  Inyección de dependencias
builder.Services.AddScoped<IConexionBD, ConexionBD>();
builder.Services.AddScoped<IProductoRepositorio, ProductoRepositorio>();
builder.Services.AddScoped<IProductoServicio, ProductoServicio>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseCors("PermitirFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();