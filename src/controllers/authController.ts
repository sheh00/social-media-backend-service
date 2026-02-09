import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

const generateToken = (user_id: number, user_name: string, email: string): string => {
  return jwt.sign(
    { user_id, user_name, email },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }  // Use a string literal instead of env variable
  );
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { first_name, last_name, user_name, email, password, date_of_birth, profile_image_url } = req.body;

    // Validation
    if (!first_name || !last_name || !user_name || !email || !password) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    // Check if username is taken
    const existingUsername = await User.findOne({
      where: { user_name }
    });

    if (existingUsername) {
      res.status(400).json({ message: 'Username is already taken' });
      return;
    }

    // Create user
    const user = await User.create({
      first_name,
      last_name,
      user_name,
      email,
      password_hash: password,
      date_of_birth,
      profile_image_url
    });

    // Generate token
    //const token = generateToken(user.user_id, user.user_name, user.email);

    res.status(201).json({
      message: 'User created successfully',
     // token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        user_name: user.user_name,
        email: user.email,
        date_of_birth: user.date_of_birth,
        profile_image_url: user.profile_image_url
      }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken(user.user_id, user.user_name, user.email);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        user_name: user.user_name,
        email: user.email,
        date_of_birth: user.date_of_birth,
        profile_image_url: user.profile_image_url
      }
    });
  } catch (error: any) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};