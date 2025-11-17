using MailKit.Net.Smtp;
using MimeKit;

namespace Uni2ClupProjectBackend.Services
{
    public class EmailService
    {
        private readonly string _host;
        private readonly int _port;
        private readonly string _username;
        private readonly string _password;
        private readonly string _displayName;

        public EmailService(IConfiguration config)
        {
            _host = config["EmailSettings:SMTP_HOST"];
            _port = int.Parse(config["EmailSettings:SMTP_PORT"]);
            _username = config["EmailSettings:SMTP_USERNAME"];
            _password = config["EmailSettings:SMTP_PASSWORD"];
            _displayName = config["EmailSettings:SMTP_DISPLAY_NAME"];
        }

        public async Task SendEmailAsync(string to, string subject, string html)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_displayName, _username));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = html,
                TextBody = html.Replace("<br>", "\n")
            };

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();

            Console.WriteLine("[MAILKIT] Bağlanıyor...");

            await client.ConnectAsync(_host, _port, MailKit.Security.SecureSocketOptions.StartTls);

            Console.WriteLine("[MAILKIT] Giriş yapılıyor...");

            await client.AuthenticateAsync(_username, _password);

            Console.WriteLine("[MAILKIT] Gönderiliyor...");

            await client.SendAsync(message);

            await client.DisconnectAsync(true);

            Console.WriteLine("[MAILKIT] Başarılı!");
        }
    }
}
