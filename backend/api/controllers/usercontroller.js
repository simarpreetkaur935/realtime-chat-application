import User from "../model/user.js";
import bcryptjs from "bcryptjs";
import jwtToken from "../utils/jwtwebToken.js";

export const userRegister = async (req, res) => {
  try {
    const { fullname, username, email, gender, password } = req.body;

    // Check required fields
    if (!fullname || !username || !email || !gender || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username or Email already exists.",
      });
    }

    // Hash Password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Generate Default Profile Picture
    const profilePic =
      gender === "male"
        ? `https://api.dicebear.com/10.x/adventurer/svg?seed=${username}`
        : `https://api.dicebear.com/10.x/lorelei/svg?seed=${username}`;

    // Create User
    const newUser = new User({
      fullname,
      username,
      email,
      gender,
      password: hashedPassword,
      profilepic: profilePic,
    });

    // Save User
    await newUser.save();
    jwtToken(newUser._id, res);


    // Response
    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user: {
        _id: newUser._id,
        fullname: newUser.fullname,
        username: newUser.username,
        email: newUser.email,
        gender: newUser.gender,
        profilepic: newUser.profilepic,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
///login

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if all fields are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required.",
      });
    }

    // Find User
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email doesn't exist. Please register first.",
      });
    }

    // Compare Password
    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password.",
      });
    }

    // Generate JWT Token
    jwtToken(user._id, res);

    // Success Response
    return res.status(200).json({
      success: true,
      message: "Login Successfully",
      user: {
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        gender: user.gender,
        profilepic: user.profilepic,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
//logout
export const userLogOut = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return res.status(200).json({
      success: true,
      message: "User Logged Out Successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};