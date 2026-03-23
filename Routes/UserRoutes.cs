
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Restaurant_Application.Models;
using Microsoft.EntityFrameworkCore;
using Restaurant_Application.Data;
using Restaurant_Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Restaurant_Application.Routes
{
    public class SubscritionRequest
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
    }
    public static class UserRoutes
    {
        public static void MapUserRoutes(this IEndpointRouteBuilder app, IConfiguration config)
        {
            var UserRoutes = app.MapGroup("/api/users").WithTags("Users");
            UserRoutes.MapGet("/", async (ApplicationDbContext db) =>
            {
                try
                {
                    var AllUsers = await db.Users.ToListAsync();
                    if (AllUsers == null)
                    {
                        return Results.NotFound();
                    }

                    return Results.Ok(AllUsers);
                }
                catch (Exception ex)
                {
                    return Results.Conflict(ex);
                }
            }).RequireAuthorization("AdminOnly");

            UserRoutes.MapPost("/subscribe", async ([FromBody] SubscritionRequest request, ApplicationDbContext db) =>
            {
                try
                {
                    await Services.MailKit.SendSubscriptionEmail(request.Email, request.Username, config);
                    return Results.Ok();
                }
                catch (Exception ex)
                {
                    return Results.Conflict(ex.Message);
                }
            });
        }
    }
}
