package com.gymmanagement.gym_management.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    /** Send welcome email with temporary credentials — runs async so login isn't blocked */
    @Async
    public void sendWelcomeEmail(String to, String name, String tempPassword) {
        String subject = "Welcome to Gym Management System";
        String body = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px">
                  <h2 style="color:#111827">Welcome, %s!</h2>
                  <p style="color:#374151">Your account has been created on <strong>GymPro</strong>.</p>
                  <div style="background:#f9fafb;padding:16px;border-radius:6px;margin:24px 0">
                    <p style="margin:0 0 8px"><strong>Email:</strong> %s</p>
                    <p style="margin:0 0 8px"><strong>Temporary Password:</strong> <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px">%s</code></p>
                  </div>
                  <p style="color:#374151">Please log in and change your password immediately.</p>
                  <a href="%s/login" style="display:inline-block;background:#111827;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:8px">Login Now</a>
                  <p style="color:#9ca3af;font-size:12px;margin-top:32px">If you did not expect this email, please ignore it.</p>
                </div>
                """.formatted(name, to, tempPassword, frontendUrl);
        sendHtmlEmail(to, subject, body);
    }

    /** Send password reset link email */
    @Async
    public void sendPasswordResetEmail(String to, String name, String resetToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
        String subject = "Password Reset Request — GymPro";
        String body = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px">
                  <h2 style="color:#111827">Password Reset</h2>
                  <p style="color:#374151">Hi %s, we received a request to reset your password.</p>
                  <p style="color:#374151">Click the button below. This link expires in <strong>1 hour</strong>.</p>
                  <a href="%s" style="display:inline-block;background:#111827;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin:16px 0">Reset Password</a>
                  <p style="color:#6b7280;font-size:13px">Or copy this link: <br><a href="%s">%s</a></p>
                  <p style="color:#9ca3af;font-size:12px;margin-top:32px">If you did not request this, please ignore this email.</p>
                </div>
                """.formatted(name, resetLink, resetLink, resetLink);
        sendHtmlEmail(to, subject, body);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
