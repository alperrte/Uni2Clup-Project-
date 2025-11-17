using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Uni2ClupProjectBackend.Services
{
    public class EmailService
    {
        private readonly string _host;
        private readonly int _port;
        private readonly string _username;
        private readonly string _password;
        private readonly string _displayName;

        public EmailService(IConfiguration configuration)
        {
            var emailSettings = configuration.GetSection("EmailSettings");
            _host = emailSettings["SMTP_HOST"] ?? "smtp.office365.com";
            _port = int.Parse(emailSettings["SMTP_PORT"] ?? "587");
            _username = emailSettings["SMTP_USERNAME"] ?? "";
            _password = emailSettings["SMTP_PASSWORD"] ?? "";
            _displayName = emailSettings["SMTP_DISPLAY_NAME"] ?? "Uni2Clup Etkinlik Sistemi";
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                using (var client = new SmtpClient(_host, _port))
                {
                    client.EnableSsl = true;
                    client.DeliveryMethod = SmtpDeliveryMethod.Network;
                    client.UseDefaultCredentials = false; // ✅ gerekli
                    client.Credentials = new NetworkCredential(_username, _password);
                    ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12; // ✅ Outlook şartı

                    var mail = new MailMessage
                    {
                        From = new MailAddress(_username, _displayName),
                        Subject = subject,
                        Body = body,
                        IsBodyHtml = false
                    };

                    mail.To.Add(toEmail);
                    await client.SendMailAsync(mail);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL ERROR] {ex.Message}");
                throw;
            }
        }
    }
}
