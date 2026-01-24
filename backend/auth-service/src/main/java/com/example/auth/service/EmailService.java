package com.example.auth.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendVerificationEmail(String to, String token) {
        String link = "http://localhost:3000/verify-email?token=" + token;
        String body = "<h1>Email Verification</h1>" +
                "<p>Please click the link below to verify your email:</p>" +
                "<a href=\"" + link + "\">Verify Email</a>";
        sendEmail(to, "Verify your email", body);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String link = "http://localhost:3000/reset-password?token=" + token;
        String body = "<h1>Password Reset</h1>" +
                "<p>Please click the link below to reset your password:</p>" +
                "<a href=\"" + link + "\">Reset Password</a>";
        sendEmail(to, "Reset your password", body);
    }
}
