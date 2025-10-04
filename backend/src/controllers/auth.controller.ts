import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { generateToken } from "../utils/jwt";


export const register = async (req: Request, res: Response): Promise<void> => {
  const {
    email,
    password,
    fullName,
    contactNo,
    notes,
    role,
    verificationDocument,
  } = req.body;

  // Validate required fields
  if (
    !email ||
    !password ||
    !fullName ||
    !contactNo ||
    !notes ||
    !role ||
    !verificationDocument
  ) {
    res.status(400).json({ message: "All required fields must be provided" });
    return;
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      fullName,
      contactNo,
      notes,
      role: role || "respondent",
      isVerified: false,
      verificationDocument,
    });
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Email Login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  try {
    const user = (await User.findOne({ email })) as typeof User.prototype & {
      _id: any;
      password?: string;
    };

    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // Continue normal login
    const match = await bcrypt.compare(password, user.password!);
    if (!match) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
    });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



