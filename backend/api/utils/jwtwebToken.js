import jwt from "jsonwebtoken";

const jwtToken = (userId, res) => {
  // Generate JWT Token
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  // Store Token in Cookie
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.SECURE !== "development",
  });

  return token;
};

export default jwtToken;