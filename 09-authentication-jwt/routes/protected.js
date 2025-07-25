// Protected routes demonstrating JWT authentication

const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireAdmin,
  requireRole,
} = require("../middleware/auth");

// GET /api/protected/public - Public endpoint (no authentication required)
router.get("/public", (req, res) => {
  res.json({
    success: true,
    message: "This is a public endpoint - no authentication required",
    timestamp: new Date().toISOString(),
  });
});

// GET /api/protected/private - Protected endpoint (authentication required)
router.get("/private", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "This is a protected endpoint - authentication required",
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/protected/admin - Admin only endpoint
router.get("/admin", authenticateToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: "This is an admin-only endpoint",
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/protected/user - User role endpoint
router.get("/user", authenticateToken, requireRole("user"), (req, res) => {
  res.json({
    success: true,
    message: "This endpoint is accessible to users with user role",
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/protected/any-role - Any authenticated user
router.get(
  "/any-role",
  authenticateToken,
  requireRole(["user", "admin"]),
  (req, res) => {
    res.json({
      success: true,
      message: "This endpoint is accessible to any authenticated user",
      user: req.user,
      timestamp: new Date().toISOString(),
    });
  }
);

// POST /api/protected/test-data - Test endpoint with request body
router.post("/test-data", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Test endpoint with request body",
    user: req.user,
    receivedData: req.body,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/protected/user-info - Get extended user information
router.get("/user-info", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Extended user information",
    user: {
      ...req.user,
      accessLevel: req.user.role === "admin" ? "full" : "limited",
      permissions:
        req.user.role === "admin"
          ? ["read", "write", "delete", "admin"]
          : ["read", "write"],
      lastAccess: new Date().toISOString(),
    },
  });
});

module.exports = router;
