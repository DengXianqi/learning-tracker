import express from 'express';
import { body, param, query as queryValidator, validationResult } from 'express-validator';
import Goal from '../models/Goal.js';
import Milestone from '../models/Milestone.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation middleware
const goalValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Category must be less than 100 characters'),
  body('targetDate')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  body('status')
    .optional()
    .isIn(['active', 'completed', 'paused', 'cancelled']).withMessage('Invalid status')
];

// GET /api/goals - Get all goals for current user
router.get('/', [
  queryValidator('status').optional().isIn(['active', 'completed', 'paused', 'cancelled']),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  queryValidator('offset').optional().isInt({ min: 0 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  const { status, limit, offset } = req.query;
  
  const goals = await Goal.findByUserId(req.user.id, {
    status,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined
  });

  res.json({
    goals,
    count: goals.length
  });
}));

// GET /api/goals/stats - Get goal statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const [statusStats, categoryStats, recentActivity] = await Promise.all([
    Goal.getStatsByUserId(req.user.id),
    Goal.getByCategory(req.user.id),
    Goal.getRecentActivity(req.user.id, 10)
  ]);

  res.json({
    byStatus: statusStats,
    byCategory: categoryStats,
    recentActivity
  });
}));

// GET /api/goals/:id - Get single goal with milestones
router.get('/:id', [
  param('id').isInt().withMessage('Invalid goal ID')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  const goal = await Goal.findByIdWithMilestones(req.params.id);
  
  if (!goal) {
    throw new NotFoundError('Goal');
  }

  // Check ownership
  if (goal.user_id !== req.user.id) {
    throw new ForbiddenError('You do not have access to this goal');
  }

  res.json({ goal });
}));

// POST /api/goals - Create new goal
router.post('/', goalValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  const { title, description, category, targetDate, milestones } = req.body;

  const goal = await Goal.create({
    userId: req.user.id,
    title,
    description,
    category,
    targetDate
  });

  // If milestones are provided, create them
  if (milestones && Array.isArray(milestones) && milestones.length > 0) {
    const createdMilestones = await Milestone.bulkCreate(goal.id, milestones);
    goal.milestones = createdMilestones;
  }

  res.status(201).json({
    message: 'Goal created successfully',
    goal
  });
}));

// PUT /api/goals/:id - Update goal
router.put('/:id', [
  param('id').isInt().withMessage('Invalid goal ID'),
  ...goalValidation
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  // Check ownership
  const isOwner = await Goal.isOwner(req.params.id, req.user.id);
  if (!isOwner) {
    throw new ForbiddenError('You do not have access to this goal');
  }

  const { title, description, category, targetDate, status } = req.body;

  const goal = await Goal.update(req.params.id, {
    title,
    description,
    category,
    targetDate,
    status
  });

  if (!goal) {
    throw new NotFoundError('Goal');
  }

  res.json({
    message: 'Goal updated successfully',
    goal
  });
}));

// DELETE /api/goals/:id - Delete goal
router.delete('/:id', [
  param('id').isInt().withMessage('Invalid goal ID')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  // Check ownership
  const isOwner = await Goal.isOwner(req.params.id, req.user.id);
  if (!isOwner) {
    throw new ForbiddenError('You do not have access to this goal');
  }

  const deleted = await Goal.delete(req.params.id);

  if (!deleted) {
    throw new NotFoundError('Goal');
  }

  res.json({
    message: 'Goal deleted successfully'
  });
}));

// PATCH /api/goals/:id/status - Update goal status
router.patch('/:id/status', [
  param('id').isInt().withMessage('Invalid goal ID'),
  body('status').isIn(['active', 'completed', 'paused', 'cancelled']).withMessage('Invalid status')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  // Check ownership
  const isOwner = await Goal.isOwner(req.params.id, req.user.id);
  if (!isOwner) {
    throw new ForbiddenError('You do not have access to this goal');
  }

  const goal = await Goal.update(req.params.id, { status: req.body.status });

  if (!goal) {
    throw new NotFoundError('Goal');
  }

  res.json({
    message: 'Goal status updated',
    goal
  });
}));

export default router;
