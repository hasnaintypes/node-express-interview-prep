const jwt = require("jsonwebtoken")

class AuthService {
  generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      issuer: "express-controllers-demo",
    })

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
      issuer: "express-controllers-demo",
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET)
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
  }
}

module.exports = new AuthService()
