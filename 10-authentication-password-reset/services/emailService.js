// Email Service - Comprehensive email functionality

const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");
const handlebars = require("handlebars");
const { AppError } = require("../utils/errors");

class EmailService {
  constructor() {
    this.transporter = null;
    this.templatesPath = path.join(__dirname, "../templates");
    this.initializeTransporter();
  }

  // Initialize email transporter
  initializeTransporter() {
    const provider = process.env.EMAIL_PROVIDER || "SMTP";

    switch (provider.toUpperCase()) {
      case "SENDGRID":
        this.initializeSendGrid();
        break;
      case "MAILGUN":
        this.initializeMailgun();
        break;
      case "SES":
        this.initializeAmazonSES();
        break;
      default:
        this.initializeSMTP();
    }
  }

  // Initialize SMTP transporter
  initializeSMTP() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Initialize SendGrid
  initializeSendGrid() {
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.transporter = sgMail;
  }

  // Initialize Mailgun
  initializeMailgun() {
    const mailgun = require("mailgun-js")({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
    });
    this.transporter = mailgun;
  }

  // Initialize Amazon SES
  initializeAmazonSES() {
    const AWS = require("aws-sdk");
    AWS.config.update({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    this.transporter = new AWS.SES({ apiVersion: "2010-12-01" });
  }

  // Test email connection
  async testConnection() {
    try {
      if (this.transporter && this.transporter.verify) {
        await this.transporter.verify();
        return true;
      }
      return true;
    } catch (error) {
      throw new AppError("Email service connection failed", 500);
    }
  }

  // Load and compile email template
  async loadTemplate(templateName, data = {}) {
    try {
      const templatePath = path.join(
        this.templatesPath,
        `${templateName}.html`
      );
      const templateSource = await fs.readFile(templatePath, "utf8");

      // Simple template replacement (using {{variable}} syntax)
      let compiledTemplate = templateSource;

      // Replace all {{variable}} with actual values
      Object.keys(data).forEach((key) => {
        const value = data[key];
        const regex = new RegExp(`{{${key}}}`, "g");
        compiledTemplate = compiledTemplate.replace(regex, value || "");
      });

      return compiledTemplate;
    } catch (error) {
      throw new AppError(`Template ${templateName} not found`, 404);
    }
  }

  // Alias for loadTemplate to maintain compatibility
  async renderTemplate(templateName, data = {}) {
    return this.loadTemplate(templateName, data);
  }

  // Send email
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `${process.env.FROM_NAME || "App"} <${process.env.FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments || [],
      };

      let result;
      const provider = process.env.EMAIL_PROVIDER || "SMTP";

      switch (provider.toUpperCase()) {
        case "SENDGRID":
          result = await this.transporter.send(mailOptions);
          break;
        case "MAILGUN":
          result = await this.transporter.messages().send(mailOptions);
          break;
        case "SES":
          result = await this.sendWithSES(mailOptions);
          break;
        default:
          result = await this.transporter.sendMail(mailOptions);
      }

      // Log email sent
      this.logEmailEvent("sent", {
        to: options.to,
        subject: options.subject,
        messageId: result.messageId || result.id,
        provider,
      });

      return result;
    } catch (error) {
      this.logEmailEvent("failed", {
        to: options.to,
        subject: options.subject,
        error: error.message,
      });
      throw new AppError("Failed to send email", 500);
    }
  }

  // Send email with SES
  async sendWithSES(mailOptions) {
    const params = {
      Source: mailOptions.from,
      Destination: {
        ToAddresses: Array.isArray(mailOptions.to)
          ? mailOptions.to
          : [mailOptions.to],
      },
      Message: {
        Subject: {
          Data: mailOptions.subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: mailOptions.html,
            Charset: "UTF-8",
          },
          Text: {
            Data: mailOptions.text,
            Charset: "UTF-8",
          },
        },
      },
    };

    return await this.transporter.sendEmail(params).promise();
  }

  // Send password reset email
  async sendPasswordResetEmail(email, resetToken, userName = "") {
    try {
      const resetUrl = `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/reset-password?token=${resetToken}`;

      const html = await this.loadTemplate("password-reset", {
        userName: userName || "User",
        resetUrl,
        expirationTime: "10 minutes",
        supportEmail: process.env.SUPPORT_EMAIL || process.env.FROM_EMAIL,
        companyName: process.env.COMPANY_NAME || "Your App",
        currentYear: new Date().getFullYear(),
      });

      await this.sendEmail({
        to: email,
        subject: "Password Reset Request",
        html,
        text: `Reset your password by visiting: ${resetUrl}\n\nThis link will expire in 10 minutes.`,
      });

      return true;
    } catch (error) {
      throw new AppError("Failed to send password reset email", 500);
    }
  }

  // Send email verification email
  async sendEmailVerificationEmail(email, verificationToken, userName = "") {
    try {
      const verificationUrl = `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/verify-email?token=${verificationToken}`;

      const html = await this.loadTemplate("email-verification", {
        userName: userName || "User",
        verificationUrl,
        supportEmail: process.env.SUPPORT_EMAIL || process.env.FROM_EMAIL,
        companyName: process.env.COMPANY_NAME || "Your App",
        currentYear: new Date().getFullYear(),
      });

      await this.sendEmail({
        to: email,
        subject: "Please verify your email address",
        html,
        text: `Please verify your email address by visiting: ${verificationUrl}`,
      });

      return true;
    } catch (error) {
      throw new AppError("Failed to send verification email", 500);
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email, userName, userRole = "user") {
    try {
      const html = await this.loadTemplate("welcome", {
        userName,
        userRole,
        loginUrl: `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/login`,
        supportEmail: process.env.SUPPORT_EMAIL || process.env.FROM_EMAIL,
        companyName: process.env.COMPANY_NAME || "Your App",
        currentYear: new Date().getFullYear(),
      });

      await this.sendEmail({
        to: email,
        subject: `Welcome to ${process.env.COMPANY_NAME || "Your App"}!`,
        html,
        text: `Welcome ${userName}! Thank you for joining us.`,
      });

      return true;
    } catch (error) {
      throw new AppError("Failed to send welcome email", 500);
    }
  }

  // Send password change confirmation
  async sendPasswordChangeConfirmation(email, userName, ipAddress, userAgent) {
    try {
      const html = await this.loadTemplate("password-changed", {
        userName,
        changeTime: new Date().toLocaleString(),
        ipAddress,
        userAgent,
        supportEmail: process.env.SUPPORT_EMAIL || process.env.FROM_EMAIL,
        companyName: process.env.COMPANY_NAME || "Your App",
        currentYear: new Date().getFullYear(),
      });

      await this.sendEmail({
        to: email,
        subject: "Password Changed Successfully",
        html,
        text: `Your password was changed successfully on ${new Date().toLocaleString()}.`,
      });

      return true;
    } catch (error) {
      throw new AppError("Failed to send password change confirmation", 500);
    }
  }

  // Send security alert
  async sendSecurityAlert(email, userName, alertType, details) {
    try {
      const html = await this.loadTemplate("security-alert", {
        userName,
        alertType,
        details,
        timestamp: new Date().toLocaleString(),
        supportEmail: process.env.SUPPORT_EMAIL || process.env.FROM_EMAIL,
        companyName: process.env.COMPANY_NAME || "Your App",
        currentYear: new Date().getFullYear(),
      });

      await this.sendEmail({
        to: email,
        subject: `Security Alert: ${alertType}`,
        html,
        text: `Security Alert: ${alertType}\n\nDetails: ${JSON.stringify(
          details,
          null,
          2
        )}`,
      });

      return true;
    } catch (error) {
      throw new AppError("Failed to send security alert", 500);
    }
  }

  // Send test email
  async sendTestEmail(email, options = {}) {
    try {
      const { subject = "Test Email", template = "test", data = {} } = options;

      const html = await this.loadTemplate(template, {
        ...data,
        testMessage: data.testMessage || "This is a test email",
        timestamp: new Date().toISOString(),
        companyName: process.env.COMPANY_NAME || "Your App",
        currentYear: new Date().getFullYear(),
      });

      await this.sendEmail({
        to: email,
        subject,
        html,
        text: data.testMessage || "This is a test email",
      });

      return true;
    } catch (error) {
      throw new AppError("Failed to send test email", 500);
    }
  }

  // Get available templates
  async getAvailableTemplates() {
    try {
      const files = await fs.readdir(this.templatesPath);
      const templates = files
        .filter((file) => file.endsWith(".html"))
        .map((file) => ({
          name: file.replace(".html", ""),
          path: path.join(this.templatesPath, file),
          description: this.getTemplateDescription(file.replace(".html", "")),
        }));

      return templates;
    } catch (error) {
      throw new AppError("Failed to load templates", 500);
    }
  }

  // Get template description
  getTemplateDescription(templateName) {
    const descriptions = {
      "password-reset": "Password reset email template",
      "email-verification": "Email verification template",
      welcome: "Welcome email template",
      test: "Test email template",
      "password-reset-confirmation": "Password reset confirmation",
      "profile-update": "Profile update notification",
      "email-change": "Email change notification",
      "preferences-update": "Email preferences update",
      unsubscribe: "Unsubscribe confirmation",
      "account-deletion": "Account deletion notification",
    };
    return descriptions[templateName] || "Email template";
  }

  // Send custom email
  async sendCustomEmail(to, options) {
    const { subject, template, data, priority = "normal" } = options;

    try {
      const html = await this.renderTemplate(template, data);

      const mailOptions = {
        from: `${process.env.FROM_NAME || "Your App"} <${
          process.env.FROM_EMAIL || "noreply@yourapp.com"
        }>`,
        to,
        subject,
        html,
        priority: priority === "high" ? "high" : "normal",
      };

      const result = await this.transporter.sendMail(mailOptions);

      this.logEmailEvent("custom_email_sent", {
        to,
        subject,
        template,
        messageId: result.messageId,
        priority,
      });

      return result;
    } catch (error) {
      this.logEmailEvent("custom_email_failed", {
        to,
        subject,
        template,
        error: error.message,
      });
      throw new AppError(`Failed to send custom email: ${error.message}`, 500);
    }
  }

  // Send bulk emails
  async sendBulkEmails(recipients, options) {
    const { subject, template, data, batchSize = 10 } = options;

    try {
      const html = await this.renderTemplate(template, data);
      const jobId = crypto.randomUUID();
      const results = [];

      // Process in batches
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);

        for (const recipient of batch) {
          try {
            const mailOptions = {
              from: `${process.env.FROM_NAME || "Your App"} <${
                process.env.FROM_EMAIL || "noreply@yourapp.com"
              }>`,
              to: recipient,
              subject,
              html,
            };

            const result = await this.transporter.sendMail(mailOptions);
            results.push({
              email: recipient,
              status: "sent",
              messageId: result.messageId,
            });
          } catch (error) {
            results.push({
              email: recipient,
              status: "failed",
              error: error.message,
            });
          }
        }

        // Add delay between batches to avoid rate limits
        if (i + batchSize < recipients.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      this.logEmailEvent("bulk_email_completed", {
        jobId,
        totalRecipients: recipients.length,
        successful: results.filter((r) => r.status === "sent").length,
        failed: results.filter((r) => r.status === "failed").length,
      });

      return { jobId, results };
    } catch (error) {
      throw new AppError("Failed to send bulk emails", 500);
    }
  }

  // Log email events
  logEmailEvent(event, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      ...data,
    };

    console.log("📧 Email Event:", JSON.stringify(logEntry));

    // In production, save to database or logging service
    // await EmailLog.create(logEntry);
  }

  // Get email analytics
  async getEmailAnalytics(startDate, endDate) {
    // In production, fetch from database
    return {
      totalSent: 150,
      totalDelivered: 145,
      totalOpened: 89,
      totalClicked: 23,
      totalBounced: 3,
      totalComplaints: 1,
      deliveryRate: 96.7,
      openRate: 61.4,
      clickRate: 25.8,
      bounceRate: 2.0,
      complaintRate: 0.7,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }

  // Preview template
  async previewTemplate(templateName, data = {}) {
    try {
      const html = await this.renderTemplate(templateName, data);
      return {
        html,
        templateName,
        data,
        previewUrl: `data:text/html;base64,${Buffer.from(html).toString(
          "base64"
        )}`,
      };
    } catch (error) {
      throw new AppError(`Failed to preview template: ${error.message}`, 500);
    }
  }

  // Additional email methods for user notifications
  async sendProfileUpdateNotification(email, data) {
    return this.sendEmail(email, "profile-update", "Profile Updated", data);
  }

  async sendEmailChangeVerification(email, data) {
    return this.sendEmail(
      email,
      "email-change-verification",
      "Verify Email Change",
      data
    );
  }

  async sendEmailChangeNotification(email, data) {
    return this.sendEmail(
      email,
      "email-change-notification",
      "Email Address Changed",
      data
    );
  }

  async sendPreferencesUpdateConfirmation(email, data) {
    return this.sendEmail(
      email,
      "preferences-update",
      "Email Preferences Updated",
      data
    );
  }

  async sendUnsubscribeConfirmation(email, data) {
    return this.sendEmail(
      email,
      "unsubscribe",
      "Unsubscribe Confirmation",
      data
    );
  }

  async sendAccountDeletionNotification(email, data) {
    return this.sendEmail(email, "account-deletion", "Account Deleted", data);
  }
}

module.exports = new EmailService();
