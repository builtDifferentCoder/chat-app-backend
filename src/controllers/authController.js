import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/* =========================================
   SIGNUP
========================================= */
export const signup = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const exists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (exists) {
      return res.status(400).json({
        message: "Email or username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: "Signup failed",
    });
  }
};

/* =========================================
   LOGIN WITH EMAIL OR USERNAME
========================================= */
export const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await User.findOne({
      $or: [{ email: login }, { username: login }],
    });

    if (!user || !user.password) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
    });
  }
};

/* =========================================
   GOOGLE LOGIN
========================================= */
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Google token is required",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { sub, name, email, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      const baseUsername = email.split("@")[0];

      let username = baseUsername;
      let count = 1;

      while (await User.findOne({ username })) {
        username = `${baseUsername}${count}`;
        count++;
      }

      user = await User.create({
        name,
        email,
        username,
        googleId: sub,
        avatar: picture,
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: "Google login failed",
    });
  }
};

/* =========================================
   GET CURRENT USER
========================================= */
export const getMe = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user",
    });
  }
};

/* =========================================
   REQUEST RESET PASSWORD
========================================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 min

    await user.save();

    res.status(200).json({
      message: "Reset token generated",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to process request",
    });
  }
};

/* =========================================
   RESET PASSWORD
========================================= */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      message: "Password reset failed",
    });
  }
};

/* =========================================
   LOGOUT
========================================= */
export const logout = async (req, res) => {
  try {
    res.status(200).json({
      message: "Logged out",
    });
  } catch (error) {
    res.status(500).json({
      message: "Logout failed",
    });
  }
};

