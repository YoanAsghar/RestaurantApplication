using Restaurant_Application.Models;
using Microsoft.EntityFrameworkCore;
using Restaurant_Application.Data;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;


namespace Restaurant_Application.Routes
{
    public static class ProductRoutes
    {
        public static void MapProductRoutes(this IEndpointRouteBuilder app)
        {
            var Group = app.MapGroup("/api/products");

            Group.MapGet("/", async (ApplicationDbContext db) =>
            {
                try
                {
                    var Products = await db.Products.ToListAsync();
                    return Results.Ok(Products);
                }
                catch (Exception)
                {
                    return Results.Conflict("Error retrieving products");
                }
            }).WithTags("Products");
            Group.MapGet("/{id}", async (ApplicationDbContext db, int id) =>
            {
                try
                {
                    var Product = await db.Products.FirstOrDefaultAsync(c => c.Id == id);
                    if (Product == null)
                    {
                        return Results.NotFound($"Product with id {id} not found");
                    }

                    return Results.Ok(Product);
                }
                catch (System.Exception)
                {
                    return Results.Problem("Error retrieving the product");
                }
            }).WithTags("Products");
        }
    }
}
