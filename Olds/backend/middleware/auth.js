// // Add this file for auth middleware
// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//   const token = req.header('Authorization')?.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'No token' });
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     console.log('Verified');
//     next();
//   } catch (err) {
//     console.log('not Verified');
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };

// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const authMiddleware = async (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader?.startsWith("Bearer "))
//     return res.status(401).json({ message: "Unauthorized" });
//   const token = authHeader.split(" ")[1];
//   try {
//     const payload = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(payload.id).select("-password");
//     if (!user) return res.status(401).json({ message: "Invalid token" });
//     req.user = user;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

// const adminOnly = (req, res, next) => {
//   if (!req.user) return res.status(401).json({ message: "Unauthorized" });
//   if (req.user.role !== "admin")
//     return res.status(403).json({ message: "Admin access required" });
//   next();
// };

// module.exports = { authMiddleware, adminOnly };

const jwt = require("jsonwebtoken");
const User = require("../models/User");


const authAdmin = async (req, res, next) => {
  console.log("Admin Authentication starts...");
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    if (user.role!="admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin privileges required" });
    }
    return res.json({
      success: true,
      user: user,
      // token,
      // user: {
      //   id: user._id,
      //   email: user.email,
      //   name: user.name,
      //   role: user.role,
      // },
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
  next();
};

const authClientUser = async (req, res, next) => {
  console.log("Client User Authentication starts");
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    return res.json({
      success: true,
      user: user,
      // token,
      // user: {
      //   id: user._id,
      //   email: user.email,
      //   name: user.name,
      //   role: user.role,
      // },
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
  next();
};

const authMiddleware = async (req, res, next) => {
  console.log("Auth middleware hitted...");
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

/**
 * Admin-only access middleware
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Admin privileges required" });
  }

  next();
};

module.exports = { authMiddleware, adminOnly, authClientUser, authAdmin };
