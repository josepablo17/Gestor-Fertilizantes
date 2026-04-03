using Control_Fertilizantes_Backend.DataAccess;
using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Interfaces;
using Control_Fertilizantes_Backend.Middlewares;
using Control_Fertilizantes_Backend.Repositories;
using Control_Fertilizantes_Backend.Services;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Servicios
builder.Services.AddControllers();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errores = context.ModelState
            .Where(x => x.Value?.Errors.Count > 0)
            .SelectMany(x => x.Value!.Errors)
            .Select(x => x.ErrorMessage)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .ToList();

        var mensaje = errores.Any()
            ? string.Join(" ", errores)
            : "Los datos enviados no son válidos.";

        var respuesta = ApiRespuesta<object>.CrearError(mensaje);

        return new BadRequestObjectResult(respuesta);
    };
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Inyección de dependencias
builder.Services.AddScoped<IConexionBD, ConexionBD>();
builder.Services.AddScoped<IProductoRepositorio, ProductoRepositorio>();
builder.Services.AddScoped<IProductoServicio, ProductoServicio>();
builder.Services.AddScoped<IProveedorRepositorio, ProveedorRepositorio>();
builder.Services.AddScoped<IProveedorServicio, ProveedorServicio>();
builder.Services.AddScoped<IUnidadMedidaRepositorio, UnidadMedidaRepositorio>();
builder.Services.AddScoped<IUnidadMedidaServicio, UnidadMedidaServicio>();
builder.Services.AddScoped<IPresentacionProductoRepositorio, PresentacionProductoRepositorio>();
builder.Services.AddScoped<IPresentacionProductoServicio, PresentacionProductoServicio>();
builder.Services.AddScoped<ICompraRepositorio, CompraRepositorio>();
builder.Services.AddScoped<ICompraServicio, CompraServicio>();
builder.Services.AddScoped<ICompraInteligenciaRepositorio, CompraInteligenciaRepositorio>();
builder.Services.AddScoped<ICompraInteligenciaServicio, CompraInteligenciaServicio>();
builder.Services.AddScoped<IComparadorProveedorRepositorio, ComparadorProveedorRepositorio>();
builder.Services.AddScoped<IComparadorProveedorServicio, ComparadorProveedorServicio>();

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

app.UseMiddleware<ManejoGlobalExcepcionesMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.Run();