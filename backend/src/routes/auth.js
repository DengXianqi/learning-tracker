import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticate, generateToken } from '../middleware/auth.js';
import { asyncHandler, ValidationError, UnauthorizedError } from '../middleware/errorHandler.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Validate Google ID token and create/login user
router.post('/google', [
  body('credential').notEmpty().withMessage('Google credential is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  const { credential } = req.body;

  // Verify Google token
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
  } catch (error) {
    throw new UnauthorizedError('Invalid Google credential');
  }

  const payload = ticket.getPayload();
  
  // Find or create user
  const user = await User.findOrCreate({
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    avatarUrl: payload.picture
  });

  // Generate JWT token
  const token = generateToken(user);

  res.json({
    message: 'Authentication successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url
    },
    token
  });
}));

// Get current user
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  const stats = await User.getStats(req.user.id);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at
    },
    stats: {
      totalGoals: parseInt(stats.total_goals) || 0,
      completedGoals: parseInt(stats.completed_goals) || 0,
      totalMilestones: parseInt(stats.total_milestones) || 0,
      completedMilestones: parseInt(stats.completed_milestones) || 0
    }
  });
}));

// Logout (client-side token removal, but we can log it)
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  // In a more complex setup, you might blacklist the token here
  res.json({ message: 'Logged out successfully' });
}));

// Refresh token
router.post('/refresh', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  const token = generateToken(user);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url
    }
  });
}));

export default router;
