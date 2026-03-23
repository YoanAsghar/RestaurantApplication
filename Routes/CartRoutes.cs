
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Restaurant_Application.Data;
using Restaurant_Application.Models;
using System.Security.Claims;

namespace Restaurant_Application.Routes
{
    public class AddToCartRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }


    public static class CartRoutes
    {
        public static void MapCartRoutes(this IEndpointRouteBuilder app)
        {
            var CartRoutes = app.MapGroup("/api/cart").WithTags("Cart");

            //Get items from the cart
            CartRoutes.MapGet("/", async (ApplicationDbContext db, ClaimsPrincipal user) =>
            {
                try
                {
                    var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (string.IsNullOrEmpty(userId))
                    {
                        return Results.Unauthorized();
                    }

                    //Find the cart of the specific user
                    var Cart = await db.Carts
                    .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                    if (Cart == null)
                    {
                        return Results.NoContent();
                    }

                    return Results.Ok(Cart);

                }
                catch (Exception ex)
                {
                    return Results.Problem(ex.Message);
                }
            }).RequireAuthorization();

            //Add items to the cart
            CartRoutes.MapPost("/", async ([FromBody] AddToCartRequest request, ApplicationDbContext db, ClaimsPrincipal user) =>
            {
                try
                {
                    var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (string.IsNullOrEmpty(userId))
                    {
                        return Results.Unauthorized();
                    }

                    // Find user's cart, or create a new one if it doesn't exist
                    var cart = await db.Carts
                        .Include(c => c.CartItems)
                        .FirstOrDefaultAsync(c => c.UserId == userId);

                    if (cart == null)
                    {
                        cart = new Cart
                        {
                            UserId = userId
                        };
                        db.Carts.Add(cart);
                    }

                    // Check if product exists
                    var product = await db.Products.FindAsync(request.ProductId);
                    if (product == null)
                    {
                        return Results.NotFound("Product not found.");
                    }

                    // Check if the item is already in the cart
                    var cartItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == request.ProductId);

                    if (cartItem != null)
                    {
                        // If item exists, update quantity
                        cartItem.Quantity += request.Quantity;
                    }
                    else
                    {
                        // If item doesn't exist, create a new cart item
                        cartItem = new CartItem
                        {
                            Cart = cart,
                            ProductId = request.ProductId,
                            Quantity = request.Quantity
                        };
                        cart.CartItems.Add(cartItem);
                    }

                    await db.SaveChangesAsync();

                    return Results.Ok(cartItem);
                }
                catch (Exception ex)
                {
                    return Results.Problem(ex.Message);
                }
            }).RequireAuthorization();

            CartRoutes.MapDelete("/{cartItemId:int}", async (int cartItemId, ApplicationDbContext db, ClaimsPrincipal user) =>
            {
                try
                {
                    var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (userId == null)
                    {
                        return Results.Unauthorized();
                    }

                    var cartItem = await db.CartItems
                        .Include(ci => ci.Cart)
                        .FirstOrDefaultAsync(ci => ci.Id == cartItemId);

                    if (cartItem == null)
                    {
                        return Results.NoContent();
                    }

                    if (cartItem.Cart.UserId != userId)
                    {
                        return Results.Forbid();
                    }

                    db.CartItems.Remove(cartItem);
                    await db.SaveChangesAsync();

                    return Results.NoContent();
                }
                catch (Exception ex)
                {
                    return Results.Problem(ex.Message);
                }
            }).RequireAuthorization();

        }
    }
}
