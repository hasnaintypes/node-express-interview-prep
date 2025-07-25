// Email service for sending various types of emails

const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Send welcome email
  async sendWelcomeEmail(email, name) {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || "noreply@example.com",
        to: email,
        subject: "Welcome to Our Platform!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome, ${name}!</h2>
            <p>Thank you for joining our platform. We're excited to have you on board!</p>
            <p>You can now access all the features of our application.</p>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <p>Best regards,<br>The Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error("Error sending welcome email:", error);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, resetToken) {
    try {
      const resetUrl = `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/reset-password/${resetToken}`;

      const mailOptions = {
        from: process.env.FROM_EMAIL || "noreply@example.com",
        to: email,
        subject: "Password Reset Request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You have requested to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>This link will expire in 10 minutes for security reasons.</p>
            <p>Best regards,<br>The Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  }

  // Send email verification email
  async sendEmailVerificationEmail(email, name, verificationToken) {
    try {
      const verificationUrl = `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/verify-email/${verificationToken}`;

      const mailOptions = {
        from: process.env.FROM_EMAIL || "noreply@example.com",
        to: email,
        subject: "Please Verify Your Email Address",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Verification Required</h2>
            <p>Hi ${name},</p>
            <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p>If you didn't create an account with us, please ignore this email.</p>
            <p>Best regards,<br>The Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email verification sent to ${email}`);
    } catch (error) {
      console.error("Error sending email verification:", error);
      throw error;
    }
  }

  // Send password change notification
  async sendPasswordChangeNotification(email, name) {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || "noreply@example.com",
        to: email,
        subject: "Password Changed Successfully",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Changed</h2>
            <p>Hi ${name},</p>
            <p>Your password has been successfully changed.</p>
            <p>If you didn't make this change, please contact our support team immediately.</p>
            <p>Best regards,<br>The Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Password change notification sent to ${email}`);
    } catch (error) {
      console.error("Error sending password change notification:", error);
      throw error;
    }
  }

  // Test email connection
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log("Email server connection successful");
      return true;
    } catch (error) {
      console.error("Email server connection failed:", error);
      return false;
    }
  }
}

module.exports = new EmailService();
