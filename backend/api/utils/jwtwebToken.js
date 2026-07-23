import jwt from "jsonwebtoken";

const jwtToken = (userId) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return token;
};

export default jwtToken;