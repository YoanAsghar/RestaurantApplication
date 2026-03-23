using Restaurant_Application.Data;
using MailKit.Net.Smtp;
using System.Security.Claims;
using MailKit.Security;
using MimeKit;
using System.Threading.Tasks;
using Restaurant_Application.Models;

namespace Restaurant_Application.Services
{
    public static class MailKit
    {
        private static string GetEmailTemplate(string title, string body)
        {
            return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }}
        .container {{ max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }}
        .header {{ font-size: 24px; font-weight: bold; color: #333; text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee; }}
        .body-content {{ padding: 20px 0; font-size: 16px; line-height: 1.5; color: #555; }}
        .footer {{ text-align: center; font-size: 12px; color: #888; padding-top: 20px; border-top: 1px solid #eeeeee; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">{title}</div>
        <div class=""body-content"">{body}</div>
        <div class=""footer"">
            <p>&copy; {System.DateTime.Now.Year} FoodMart. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
        }

        public static async Task SendSubscriptionEmail(string toEmail, string username, IConfiguration config)
        {
            var emailSettings = config.GetSection("EmailSettings");
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("FoodMart", emailSettings["Email"]));
                message.To.Add(new MailboxAddress(username, toEmail));
                message.Subject = "Thank you for subscribing!";

                string title = "Welcome to FoodMart!";
                string body = $"<p>Hi {username},</p><p>Thank you for subscribing to our newsletter. We're excited to have you with us. Look out for exclusive offers and updates!</p>";
                
                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = GetEmailTemplate(title, body)
                };
                message.Body = bodyBuilder.ToMessageBody();

                using var smtpClient = new SmtpClient();
                await smtpClient.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
                await smtpClient.AuthenticateAsync(emailSettings["Email"], emailSettings["Password"]);
                await smtpClient.SendAsync(message);
                await smtpClient.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                throw;
            }
        }

        public static async Task SendOrderCompletedEmail(User user, IConfiguration config)
        {
            var emailSettings = config.GetSection("EmailSettings");
            try
            {
                if (user == null || string.IsNullOrEmpty(user.Email)) return;

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("FoodMart", emailSettings["Email"]));
                message.To.Add(new MailboxAddress(user.UserName, user.Email));
                message.Subject = "Your FoodMart order is confirmed!";

                string title = "Your purchase is on the way!";
                string body = $"<p>Hi {user.UserName},</p><p>Thank you for your recent purchase. We've received your order and are getting it ready for shipment.</p>";

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = GetEmailTemplate(title, body)
                };
                message.Body = bodyBuilder.ToMessageBody();

                using var smtpClient = new SmtpClient();
                await smtpClient.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
                await smtpClient.AuthenticateAsync(emailSettings["Email"], emailSettings["Password"]);
                await smtpClient.SendAsync(message);
                await smtpClient.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                throw;
            }
        }
    }
}
