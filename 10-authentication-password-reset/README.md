# 10 - Password Reset & Email Integration

## 🎯 Learning Objectives

- Implement secure password reset functionality
- Integrate email services with Nodemailer
- Generate and validate reset tokens
- Handle email templates and styling
- Implement rate limiting and security measures
- Create comprehensive email workflows

## 📧 Email Integration Overview

Email integration is crucial for user authentication flows, notifications, and communication.

### Common Email Use Cases:

- Password reset requests
- Email verification
- Welcome emails
- Security notifications
- Account updates
- Marketing communications

## 🔄 Password Reset Flow

### Secure Password Reset Process:

```
1. User requests password reset
2. Generate secure reset token
3. Store token with expiration
4. Send reset email with token
5. User clicks reset link
6. Validate token and expiration
7. Allow password update
8. Invalidate reset token
9. Send confirmation email
```

### Security Considerations:

- **Token Expiration**: Short-lived tokens (10-15 minutes)
- **Single Use**: Tokens invalidated after use
- **Rate Limiting**: Prevent spam requests
- **Secure Generation**: Cryptographically secure tokens
- **No User Enumeration**: Same response for valid/invalid emails

## 🔐 Token Generation & Validation

### Secure Token Generation:

```javascript
const crypto = require("crypto");

// Generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Hash token for storage
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Generate token with expiration
const createPasswordResetToken = async (userId) => {
  const resetToken = generateResetToken();
  const hashedToken = hashToken(resetToken);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await User.update(userId, {
    passwordResetToken: hashedToken,
    passwordResetExpires: expiresAt,
  });

  return resetToken; // Send unhashed token via email
};
```

### Token Validation:

```javascript
const validateResetToken = async (token) => {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  return user;
};
```

## 📮 Nodemailer Configuration

### SMTP Setup:

```javascript
const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};
```

### Email Service Class:

```javascript
class EmailService {
  constructor() {
    this.transporter = createTransporter();
  }

  async sendEmail(options) {
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent:", info.messageId);
      return info;
    } catch (error) {
      console.error("Email sending failed:", error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = this.generatePasswordResetTemplate(resetUrl);

    await this.sendEmail({
      to: email,
      subject: "Password Reset Request",
      html,
      text: `Reset your password: ${resetUrl}`,
    });
  }
}
```

## 🎨 Email Templates

### HTML Email Template:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        background: #007bff;
        color: white;
        padding: 20px;
        text-align: center;
        border-radius: 5px 5px 0 0;
      }
      .content {
        background: #f8f9fa;
        padding: 30px;
        border-radius: 0 0 5px 5px;
      }
      .button {
        display: inline-block;
        background: #007bff;
        color: white;
        padding: 12px 30px;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      }
      .footer {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #ddd;
        font-size: 12px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>
        You requested a password reset for your account. Click the button below
        to reset your password:
      </p>
      <a href="{{resetUrl}}" class="button">Reset Password</a>
      <p>This link will expire in 10 minutes for security reasons.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </body>
</html>
```

### Template Engine Integration:

```javascript
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

class TemplateService {
  constructor() {
    this.templatesPath = path.join(__dirname, "../templates");
  }

  compileTemplate(templateName, data) {
    const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
    const templateSource = fs.readFileSync(templatePath, "utf8");
    const template = handlebars.compile(templateSource);
    return template(data);
  }

  generatePasswordResetEmail(resetUrl, userName) {
    return this.compileTemplate("password-reset", {
      resetUrl,
      userName,
      expirationTime: "10 minutes",
      supportEmail: process.env.SUPPORT_EMAIL,
    });
  }
}
```

## 🛡️ Security Measures

### Rate Limiting:

```javascript
const rateLimit = require("express-rate-limit");

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per window
  message: {
    error: "Too many password reset requests. Please try again later.",
  },
  keyGenerator: (req) => {
    return req.body.email || req.ip;
  },
});

app.use("/auth/forgot-password", passwordResetLimiter);
```

### Input Validation:

```javascript
const { body, validationResult } = require("express-validator");

const validatePasswordReset = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),

  body("token")
    .isLength({ min: 64, max: 64 })
    .isHexadecimal()
    .withMessage("Invalid reset token"),

  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])/)
    .withMessage("Password must meet security requirements"),
];
```

### Audit Logging:

```javascript
const auditLogger = {
  logPasswordResetRequest: (email, ip, userAgent) => {
    console.log(`Password reset requested: ${email} from ${ip}`);
    // Log to audit system
  },

  logPasswordResetSuccess: (email, ip) => {
    console.log(`Password reset successful: ${email} from ${ip}`);
    // Log to audit system
  },

  logPasswordResetFailure: (token, ip, reason) => {
    console.log(`Password reset failed: ${reason} from ${ip}`);
    // Log to audit system
  },
};
```

## 📱 Multi-Channel Communication

### SMS Integration:

```javascript
const twilio = require("twilio");

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendPasswordResetSMS(phoneNumber, resetCode) {
    await this.client.messages.create({
      body: `Your password reset code is: ${resetCode}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
  }
}
```

### Push Notifications:

```javascript
const admin = require("firebase-admin");

class PushNotificationService {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  async sendSecurityAlert(deviceToken, message) {
    const payload = {
      notification: {
        title: "Security Alert",
        body: message,
      },
      token: deviceToken,
    };

    await admin.messaging().send(payload);
  }
}
```

## 🔄 Complete Email Workflows

### Welcome Email Sequence:

```javascript
class EmailWorkflowService {
  async sendWelcomeSequence(user) {
    // Immediate welcome email
    await this.sendWelcomeEmail(user);

    // Schedule follow-up emails
    setTimeout(() => {
      this.sendGettingStartedEmail(user);
    }, 24 * 60 * 60 * 1000); // 24 hours

    setTimeout(() => {
      this.sendFeatureHighlightEmail(user);
    }, 7 * 24 * 60 * 60 * 1000); // 7 days
  }

  async sendSecurityNotification(user, event) {
    const template = this.getSecurityTemplate(event.type);

    await emailService.sendEmail({
      to: user.email,
      subject: `Security Alert: ${event.type}`,
      html: template.render({
        userName: user.name,
        event: event,
        timestamp: new Date().toISOString(),
        ipAddress: event.ipAddress,
        location: event.location,
      }),
    });
  }
}
```

## 🧪 Testing Email Functionality

### Email Testing Strategies:

```javascript
describe("Password Reset Email", () => {
  let emailService;
  let mockTransporter;

  beforeEach(() => {
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: "test-id" }),
    };
    emailService = new EmailService(mockTransporter);
  });

  it("should send password reset email", async () => {
    await emailService.sendPasswordResetEmail(
      "test@example.com",
      "reset-token"
    );

    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      from: expect.any(String),
      to: "test@example.com",
      subject: "Password Reset Request",
      html: expect.stringContaining("reset-token"),
      text: expect.any(String),
    });
  });
});
```

### Integration Testing:

```javascript
describe("Password Reset Flow", () => {
  it("should complete full password reset flow", async () => {
    // Request password reset
    const resetResponse = await request(app)
      .post("/auth/forgot-password")
      .send({ email: "test@example.com" })
      .expect(200);

    // Extract token from email (in test environment)
    const resetToken = extractTokenFromEmail();

    // Reset password
    await request(app)
      .post("/auth/reset-password")
      .send({
        token: resetToken,
        password: "NewPassword123!",
      })
      .expect(200);

    // Verify login with new password
    await request(app)
      .post("/auth/login")
      .send({
        email: "test@example.com",
        password: "NewPassword123!",
      })
      .expect(200);
  });
});
```

## 📊 Email Analytics & Monitoring

### Email Metrics:

```javascript
class EmailAnalytics {
  async trackEmailSent(emailType, recipient) {
    await Analytics.track("email_sent", {
      type: emailType,
      recipient: recipient,
      timestamp: new Date(),
    });
  }

  async trackEmailOpened(emailId, recipient) {
    await Analytics.track("email_opened", {
      emailId: emailId,
      recipient: recipient,
      timestamp: new Date(),
    });
  }

  async trackLinkClicked(emailId, linkUrl, recipient) {
    await Analytics.track("email_link_clicked", {
      emailId: emailId,
      linkUrl: linkUrl,
      recipient: recipient,
      timestamp: new Date(),
    });
  }
}
```

## 🔧 Email Service Providers

### Provider Comparison:

```javascript
// SendGrid
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Mailgun
const mailgun = require("mailgun-js")({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

// Amazon SES
const AWS = require("aws-sdk");
const ses = new AWS.SES({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
```

## 💻 Code Examples

Check out the complete implementation with:

- Secure password reset flow
- Email service integration
- Template system
- Rate limiting and security
- Comprehensive testing
- Analytics and monitoring

## ⚠️ Common Pitfalls

1. **Insecure Tokens**: Using predictable or weak tokens
2. **No Expiration**: Tokens that don't expire
3. **User Enumeration**: Revealing if email exists
4. **No Rate Limiting**: Allowing spam requests
5. **Plain Text Tokens**: Storing unhashed tokens
6. **Missing Validation**: Not validating email addresses
7. **No Audit Logging**: Not tracking security events

## 🏋️ Practice

- [ ] Implement complete password reset system
- [ ] Create email verification workflow
- [ ] Build notification system
- [ ] Add SMS integration
- [ ] Implement email templates
- [ ] Create analytics dashboard
- [ ] Build email queue system
- [ ] Add multi-language support

```

```

```


```
