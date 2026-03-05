using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Restaurant_Application.Models;
using Microsoft.EntityFrameworkCore;
using Restaurant_Application.Data;
using Microsoft.AspNetCore.Mvc;

namespace Restaurant_Application.Routes
{
    public static class AuthRoutes
    {
        public static void MapAuthRoutes(this IEndpointRouteBuilder app)
        {
            var AuthRoutes = app.MapGroup("/api/auth/");
            var passwordHash = new PasswordHasher<User>();

            AuthRoutes.MapPost("/register", async ([FromBody] User user, ApplicationDbContext db) =>
            {
                try
                {
                    User? CheckIfUserExists = await db.Users.FirstOrDefaultAsync(c => c.Email.ToLower() == user.Email.ToLower());
                    if (CheckIfUserExists != null)
                    {
                        return Results.BadRequest("User already exists");
                    }

                    user.RegisterDate = DateTime.UtcNow;
                    user.PasswordHash = passwordHash.HashPassword(user, user.PasswordHash);

                    db.Users.Add(user);
                    await db.SaveChangesAsync();

                    return Results.Ok(user);
                }
                catch (Exception ex)
                {
                    return Results.BadRequest(ex);
                }
            }).WithTags("Auth");

            AuthRoutes.MapPost("/login", async ([FromBody] User user, ApplicationDbContext db, IConfiguration config) =>
            {
                try
                {
                    User? CheckIfUserExists = await db.Users.FirstOrDefaultAsync(c => c.Email.ToLower() == user.Email.ToLower());

                    if (CheckIfUserExists == null)
                    {
                        return Results.BadRequest("Invalid credentials");
                    }

                    var result = passwordHash.VerifyHashedPassword(CheckIfUserExists, CheckIfUserExists.PasswordHash, user.PasswordHash);

                    if (result == PasswordVerificationResult.Failed)
                    {
                        return Results.BadRequest("Invalid credentials");
                    }
                    var jwtSettings = config.GetSection("JwtSettings");
                    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]));
                    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                    var token = new JwtSecurityToken(
                        issuer: jwtSettings["Issuer"],
                        audience: jwtSettings["Audience"],
                        claims: new[]
                        {
                          new Claim(ClaimTypes.Email, CheckIfUserExists.Email),
                          new Claim(ClaimTypes.NameIdentifier, CheckIfUserExists.Id.ToString())
                        },
                        expires: DateTime.UtcNow.AddMinutes(60),
                        signingCredentials: creds
                    );

                    var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
                    return Results.Ok(new { token = tokenString });
                }
                catch (Exception ex)
                {
                    return Results.BadRequest(ex);
                }
            }).WithTags("Auth");
        }

    }

}
