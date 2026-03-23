using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System.Threading.Tasks;

namespace Restaurant_Application.Services
{
    public static class MailKit
    {
        public static async Task SendSubscriptionEmail(string toEmail, string username, IConfiguration config)
        {
            try
            {
                var emailSettings = config.GetSection("EmailSettings");
                string Server = "smtp.gmail.com";
                int Port = 587;
                var Message = new MimeMessage();

                Message.From.Add(new MailboxAddress("FoodMart", "yoanxl31@gmail.com"));
                Message.To.Add(new MailboxAddress("New User", toEmail));
                Message.Subject = "Thank you for subscribing";

                var BodyBuilder = new BodyBuilder
                {
                    HtmlBody = "Thank you for subscribing :)",
                };

                Message.Body = BodyBuilder.ToMessageBody();

                Console.WriteLine(emailSettings["Email"] + emailSettings["Password"]);

                using var SmtpClient = new SmtpClient();
                SmtpClient.CheckCertificateRevocation = false;
                await SmtpClient.ConnectAsync(Server, Port, SecureSocketOptions.StartTls);
                await SmtpClient.AuthenticateAsync(emailSettings["Email"], emailSettings["Password"]);
                await SmtpClient.SendAsync(Message);
                await SmtpClient.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                throw;
            }

        }
    }
}
