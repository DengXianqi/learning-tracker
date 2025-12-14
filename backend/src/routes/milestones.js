import express from 'express';
import { body, param, validationResult } from 'express-validator';
import Milestone from '../models/Milestone.js';
import Goal from '../models/Goal.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Helper to check goal ownership
const checkGoalOwnership = async (goalId, userId) => {
  const isOwner = await Goal.isOwner(goalId, userId);
  if (!isOwner) {
    throw new ForbiddenError('You do not have access to this goal');
  }
};

// Helper to check milestone ownership (via goal)
const checkMilestoneOwnership = async (milestoneId, userId) => {
  const goalId = await Milestone.getGoalId(milestoneId);
  if (!goalId) {
    throw new NotFoundError('Milestone');
  }
  await checkGoalOwnership(goalId, userId);
  return goalId;
};

// Validation middleware
const milestoneValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('orderIndex')
    .optional()
    .isInt({ min: 0 }).withMessage('Order index must be a positive integer')
];

// GET /api/milestones/goal/:goalId - Get all milestones for a goal
router.get('/goal/:goalId', [
  param('goalId').isInt().withMessage('Invalid goal ID')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  await checkGoalOwnership(req.params.goalId, req.user.id);

  const milestones = await Milestone.findByGoalId(req.params.goalId);

  res.json({
    milestones,
    count: milestones.length
  });
}));

// GET /api/milestones/:id - Get single milestone
router.get('/:id', [
  param('id').isInt().withMessage('Invalid milestone ID')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  await checkMilestoneOwnership(req.params.id, req.user.id);

  const milestone = await Milestone.findById(req.params.id);

  if (!milestone) {
    throw new NotFoundError('Milestone');
  }

  res.json({ milestone });
}));

// POST /api/milestones/goal/:goalId - Create new milestone
router.post('/goal/:goalId', [
  param('goalId').isInt().withMessage('Invalid goal ID'),
  ...milestoneValidation
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  await checkGoalOwnership(req.params.goalId, req.user.id);

  const { title, description, orderIndex } = req.body;

  const milestone = await Milestone.create({
    goalId: parseInt(req.params.goalId),
    title,
    description,
    orderIndex
  });

  res.status(201).json({
    message: 'Milestone created successfully',
    milestone
  });
}));

// PUT /api/milestones/:id - Update milestone
router.put('/:id', [
  param('id').isInt().withMessage('Invalid milestone ID'),
  ...milestoneValidation
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  await checkMilestoneOwnership(req.params.id, req.user.id);

  const { title, description, orderIndex } = req.body;

  const milestone = await Milestone.update(req.params.id, {
    title,
    description,
    orderIndex
  });

  if (!milestone) {
    throw new NotFoundError('Milestone');
  }

  res.json({
    message: 'Milestone updated successfully',
    milestone
  });
}));

// PATCH /api/milestones/:id/complete - Mark milestone as complete
router.patch('/:id/complete', [
  param('id').isInt().withMessage('Invalid milestone ID')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  await checkMilestoneOwnership(req.params.id, req.user.id);

  const milestone = await Milestone.complete(req.params.id);

  if (!milestone) {
    throw new NotFoundError('Milestone');
  }

  res.json({
    message: 'Milestone marked as complete',
    milestone
  });
}));

// PATCH /api/milestones/:id/uncomplete - Mark milestone as incomplete
router.patch('/:id/uncomplete', [
  param('id').isInt().withMessage('Invalid milestone ID')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  await checkMilestoneOwnership(req.params.id, req.user.id);

  const milestone = await Milestone.uncomplete(req.params.id);

  if (!milestone) {
    throw new NotFoundError('Milestone');
  }

  res.json({
    message: 'Milestone marked as incomplete',
    milestone
  });
}));

// PATCH /api/milestones/:id/toggle - Toggle milestone completion
router.patch('/:id/toggle', [
  param('id').isInt().withMessage('Invalid milestone ID')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  await checkMilestoneOwnership(req.params.id, req.user.id);

  const milestone = await Milestone.toggleComplete(req.params.id);

  if (!milestone) {
    throw new NotFoundError('Milestone');
  }

  res.json({
    message: `Milestone marked as ${milestone.completed ? 'complete' : 'incomplete'}`,
    milestone
  });
}));

// DELETE /api/milestones/:id - Delete milestone
router.delete('/:id', [
  param('id').isInt().withMessage('Invalid milestone ID')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  await checkMilestoneOwnership(req.params.id, req.user.id);

  const deleted = await Milestone.delete(req.params.id);

  if (!deleted) {
    throw new NotFoundError('Milestone');
  }

  res.json({
    message: 'Milestone deleted successfully'
  });
}));

// PUT /api/milestones/goal/:goalId/reorder - Reorder milestones
router.put('/goal/:goalId/reorder', [
  param('goalId').isInt().withMessage('Invalid goal ID'),
  body('milestoneIds').isArray().withMessage('milestoneIds must be an array'),
  body('milestoneIds.*').isInt().withMessage('Each milestone ID must be an integer')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  await checkGoalOwnership(req.params.goalId, req.user.id);

  await Milestone.reorder(req.params.goalId, req.body.milestoneIds);

  const milestones = await Milestone.findByGoalId(req.params.goalId);

  res.json({
    message: 'Milestones reordered successfully',
    milestones
  });
}));

export default router;
