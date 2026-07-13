import jwt from "jsonwebtoken";
import User from "../model/user.js";

const isLogin = async (req, res, next) => {
  try {
    // Get JWT Token from Cookie
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "User Unauthorized",
      });
    }

    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find User
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    // Store User in Request
    req.user = user;

    next();
  } catch (error) {
    console.error("Error in isLogin middleware:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};

export default isLogin;