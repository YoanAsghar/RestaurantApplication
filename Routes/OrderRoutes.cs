using System.Security.Claims;
using Restaurant_Application.Services;
using Restaurant_Application.Models;
using Microsoft.EntityFrameworkCore;
using Restaurant_Application.Data;
using Microsoft.AspNetCore.Mvc;

namespace Restaurant_Application.Routes
{
    public static class OrderRoutes
    {
        public static void MapOrderRoutes(this IEndpointRouteBuilder app, IConfiguration config)
        {
            var OrderRoutes = app.MapGroup("/api/orders").WithTags("Orders");

            //Get all orders created 
            OrderRoutes.MapGet("/", async (ApplicationDbContext db, [FromQuery] int PageSize = 20, [FromQuery] int Page = 1) =>
            {
                try
                {
                    var skip = (Page - 1) * PageSize;

                    // Join Orders with Users to include customer information
                    var ordersWithUsers = await db.Orders
                        .Join(db.Users,
                              order => order.UserId,
                              user => user.Id,
                              (order, user) => new
                              {
                                  OrderId = order.OrderId,
                                  OrderDate = order.OrderDate,
                                  OrderTotal = order.OrderTotal,
                                  Status = order.Status,
                                  CustomerName = user.Email
                              })
                        .OrderByDescending(o => o.OrderDate)
                        .Skip(skip)
                        .Take(PageSize)
                        .ToListAsync();

                    var totalOrders = await db.Orders.CountAsync();

                    var response = new
                    {
                        TotalOrders = totalOrders,
                        PageNumber = Page,
                        PageSize = PageSize,
                        Data = ordersWithUsers
                    };

                    return Results.Ok(response);
                }
                catch (Exception ex)
                {
                    return Results.Problem(ex.Message);
                }
            }).RequireAuthorization("AdminOnly");

            OrderRoutes.MapGet("/me", async (ApplicationDbContext db, ClaimsPrincipal user, [FromQuery] string? status) =>
            {
                try
                {
                    var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (string.IsNullOrEmpty(userId))
                    {
                        return Results.Unauthorized();
                    }

                    IQueryable<Order> ordersQuery = db.Orders.Where(u => u.UserId == userId);

                    if (!string.IsNullOrEmpty(status))
                    {
                        ordersQuery = ordersQuery.Where(o => o.Status.ToLower() == status.ToLower());
                    }

                    var orders = await ordersQuery
                    .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                    .ToListAsync();

                    return Results.Ok(orders);
                }
                catch (Exception ex)
                {
                    return Results.Conflict(ex);
                }

            }).RequireAuthorization();

            //Delete order
            OrderRoutes.MapDelete("/{id}", (ApplicationDbContext db, ClaimsPrincipal user) =>
            {
                try
                {
                }
                catch (System.Exception ex)
                {
                    throw ex;
                }
            }).RequireAuthorization("AdminOnly");

            //Create a new order
            OrderRoutes.MapPost("/", async (ApplicationDbContext db, ClaimsPrincipal user, IConfiguration config) =>
            {
                var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Results.Unauthorized();
                }

                var userObject = await db.Users.FindAsync(userId);
                if (userObject == null)
                {
                    return Results.NotFound("User not found.");
                }

                // 1. Find the user's cart with all its items and the related product details.
                var cart = await db.Carts
                    .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart == null || !cart.CartItems.Any())
                {
                    return Results.BadRequest("Your cart is empty.");
                }

                // 2. Create a new Order and populate it.
                var order = new Order
                {
                    UserId = userId,
                    OrderDate = DateTime.UtcNow,
                    Status = "Pending", // Default status for a new order
                    OrderDetails = new List<OrderDetail>()
                };

                // 3. Calculate total and create OrderDetail for each CartItem.
                decimal orderTotal = 0;
                foreach (var item in cart.CartItems)
                {
                    var orderDetail = new OrderDetail
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        Price = item.Product.Price // Lock the price at the time of purchase
                    };
                    order.OrderDetails.Add(orderDetail);
                    orderTotal += item.Quantity * item.Product.Price;
                }
                order.OrderTotal = orderTotal;

                // 4. Add the new order to the context.
                db.Orders.Add(order);

                // 5. Remove the cart. EF Core will handle deleting the associated CartItems due to the relationship.
                db.Carts.Remove(cart);

                // 6. Save all changes in a single transaction.
                await db.SaveChangesAsync();

                //Send email to the user
                await Services.MailKit.SendOrderCompletedEmail(userObject, config);
                return Results.Ok(order);

            }).RequireAuthorization();
        }
    }
}
