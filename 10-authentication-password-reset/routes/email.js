// Email Routes - Email management and analytics

const express = require("express");
const router = express.Router();
const emailService = require("../services/emailService");
const { ValidationError, AuthorizationError } = require("../utils/errors");

// Mock authentication middleware (in real app, use proper auth)
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new AuthorizationError("Access token required");
  }
  // In real app, verify JWT token
  next();
};

// @route   GET /api/email/templates
// @desc    Get available email templates
// @access  Public
router.get("/templates", async (req, res, next) => {
  try {
    const templates = await emailService.getAvailableTemplates();

    res.json({
      success: true,
      data: {
        templates,
        count: templates.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/email/send
// @desc    Send custom email (admin only)
// @access  Private (Admin)
router.post("/send", requireAuth, async (req, res, next) => {
  try {
    const { to, subject, template, data, priority = "normal" } = req.body;

    // Validate required fields
    if (!to || !subject || !template) {
      throw new ValidationError("to, subject, and template are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new ValidationError("Invalid email format");
    }

    // Send email
    const result = await emailService.sendCustomEmail(to, {
      subject,
      template,
      data: data || {},
      priority,
    });

    res.json({
      success: true,
      message: "Email sent successfully",
      data: {
        messageId: result.messageId,
        recipient: to,
        subject,
        template,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/email/analytics
// @desc    Get email analytics
// @access  Private (Admin)
router.get("/analytics", requireAuth, async (req, res, next) => {
  try {
    const { startDate, endDate, template } = req.query;

    const analytics = await emailService.getEmailAnalytics({
      startDate,
      endDate,
      template,
    });

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/email/test
// @desc    Test email configuration
// @access  Private (Admin)
router.post("/test", requireAuth, async (req, res, next) => {
  try {
    const { to, type = "connection" } = req.body;

    if (!to) {
      throw new ValidationError("Recipient email is required");
    }

    let result;

    switch (type) {
      case "connection":
        result = await emailService.testConnection();
        break;
      case "template":
        result = await emailService.sendTestEmail(to, {
          subject: "Test Email",
          template: "test",
          data: {
            testMessage: "This is a test email",
            timestamp: new Date().toISOString(),
          },
        });
        break;
      default:
        throw new ValidationError(
          'Invalid test type. Use "connection" or "template"'
        );
    }

    res.json({
      success: true,
      message: "Email test completed successfully",
      data: {
        type,
        result,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/email/queue
// @desc    Get email queue status
// @access  Private (Admin)
router.get("/queue", requireAuth, async (req, res, next) => {
  try {
    const queueStatus = await emailService.getQueueStatus();

    res.json({
      success: true,
      data: queueStatus,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/email/bulk
// @desc    Send bulk emails
// @access  Private (Admin)
router.post("/bulk", requireAuth, async (req, res, next) => {
  try {
    const { recipients, subject, template, data, batchSize = 10 } = req.body;

    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new ValidationError("recipients array is required");
    }

    if (!subject || !template) {
      throw new ValidationError("subject and template are required");
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = recipients.filter((email) => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      throw new ValidationError(
        `Invalid email formats: ${invalidEmails.join(", ")}`
      );
    }

    // Send bulk emails
    const result = await emailService.sendBulkEmails(recipients, {
      subject,
      template,
      data: data || {},
      batchSize,
    });

    res.json({
      success: true,
      message: "Bulk email job queued successfully",
      data: {
        totalRecipients: recipients.length,
        batchSize,
        estimatedBatches: Math.ceil(recipients.length / batchSize),
        jobId: result.jobId,
        queuedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/email/logs
// @desc    Get email logs
// @access  Private (Admin)
router.get("/logs", requireAuth, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      recipient,
      template,
      startDate,
      endDate,
    } = req.query;

    const logs = await emailService.getEmailLogs({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      recipient,
      template,
      startDate,
      endDate,
    });

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/email/preview
// @desc    Preview email template
// @access  Private (Admin)
router.post("/preview", requireAuth, async (req, res, next) => {
  try {
    const { template, data } = req.body;

    if (!template) {
      throw new ValidationError("Template is required");
    }

    const preview = await emailService.previewTemplate(template, data || {});

    res.json({
      success: true,
      data: {
        template,
        preview,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
