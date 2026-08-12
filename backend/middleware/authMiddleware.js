const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "No token provided, authorization denied",
    });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization header",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id;

    if (!userId || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    req.user = {
      _id: String(userId),
      id: String(userId),
      role: decoded.role,
      driverId: decoded.driverId || null,
    };

    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to perform this action",
    });
  }

  return next();
};

auth.authorizeRoles = authorizeRoles;
auth.ownerOnly = authorizeRoles("owner");
auth.driverOnly = authorizeRoles("driver");
auth.ownerOrDriver = authorizeRoles("owner", "driver");

module.exports = auth;
