import express from 'express';
import { query as queryValidator, param, validationResult } from 'express-validator';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { asyncHandler, ValidationError, ApiError } from '../middleware/errorHandler.js';
import { query } from '../config/database.js';

const router = express.Router();

// Mock course data for development (since external APIs require registration)
// In production, replace with actual API calls to Coursera, Udemy, etc.
const mockCourses = [
  {
    id: 'course-1',
    title: 'Introduction to Python Programming',
    provider: 'Coursera',
    description: 'Learn Python basics including variables, loops, and functions.',
    url: 'https://www.coursera.org/learn/python',
    thumbnailUrl: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Python',
    duration: '4 weeks',
    level: 'Beginner',
    rating: 4.8,
    enrollments: 1200000,
    skills: ['Python', 'Programming Basics', 'Problem Solving']
  },
  {
    id: 'course-2',
    title: 'Full Stack Web Development',
    provider: 'Udemy',
    description: 'Complete guide to building web applications with React and Node.js.',
    url: 'https://www.udemy.com/course/fullstack-webdev',
    thumbnailUrl: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Web+Dev',
    duration: '40 hours',
    level: 'Intermediate',
    rating: 4.6,
    enrollments: 450000,
    skills: ['React', 'Node.js', 'JavaScript', 'HTML/CSS']
  },
  {
    id: 'course-3',
    title: 'Machine Learning Fundamentals',
    provider: 'Coursera',
    description: 'Master machine learning algorithms and their applications.',
    url: 'https://www.coursera.org/learn/machine-learning',
    thumbnailUrl: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=ML',
    duration: '11 weeks',
    level: 'Intermediate',
    rating: 4.9,
    enrollments: 800000,
    skills: ['Machine Learning', 'Python', 'Statistics', 'Neural Networks']
  },
  {
    id: 'course-4',
    title: 'Data Structures and Algorithms',
    provider: 'edX',
    description: 'Learn essential data structures and algorithmic techniques.',
    url: 'https://www.edx.org/course/data-structures',
    thumbnailUrl: 'https://via.placeholder.com/300x200/EF4444/FFFFFF?text=DSA',
    duration: '8 weeks',
    level: 'Intermediate',
    rating: 4.7,
    enrollments: 300000,
    skills: ['Algorithms', 'Data Structures', 'Java', 'Problem Solving']
  },
  {
    id: 'course-5',
    title: 'UI/UX Design Principles',
    provider: 'Coursera',
    description: 'Learn to design beautiful and user-friendly interfaces.',
    url: 'https://www.coursera.org/learn/ux-design',
    thumbnailUrl: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=UX+Design',
    duration: '6 weeks',
    level: 'Beginner',
    rating: 4.5,
    enrollments: 250000,
    skills: ['UX Design', 'UI Design', 'Figma', 'User Research']
  },
  {
    id: 'course-6',
    title: 'Cloud Computing with AWS',
    provider: 'Udemy',
    description: 'Master Amazon Web Services and cloud architecture.',
    url: 'https://www.udemy.com/course/aws-certified',
    thumbnailUrl: 'https://via.placeholder.com/300x200/FF9900/FFFFFF?text=AWS',
    duration: '30 hours',
    level: 'Intermediate',
    rating: 4.8,
    enrollments: 500000,
    skills: ['AWS', 'Cloud Computing', 'DevOps', 'Serverless']
  },
  {
    id: 'course-7',
    title: 'JavaScript: The Complete Guide',
    provider: 'Udemy',
    description: 'From beginner to advanced JavaScript developer.',
    url: 'https://www.udemy.com/course/javascript-complete',
    thumbnailUrl: 'https://via.placeholder.com/300x200/F7DF1E/000000?text=JavaScript',
    duration: '52 hours',
    level: 'All Levels',
    rating: 4.7,
    enrollments: 700000,
    skills: ['JavaScript', 'ES6+', 'DOM', 'Async Programming']
  },
  {
    id: 'course-8',
    title: 'Cybersecurity Fundamentals',
    provider: 'edX',
    description: 'Learn to protect systems and networks from cyber threats.',
    url: 'https://www.edx.org/course/cybersecurity',
    thumbnailUrl: 'https://via.placeholder.com/300x200/1F2937/FFFFFF?text=Security',
    duration: '10 weeks',
    level: 'Beginner',
    rating: 4.6,
    enrollments: 200000,
    skills: ['Cybersecurity', 'Network Security', 'Ethical Hacking']
  }
];

// Search courses (mock implementation)
// In production: call external API like Coursera or Udemy
router.get('/search', optionalAuth, [
  queryValidator('q').optional().trim().isLength({ min: 1, max: 100 }),
  queryValidator('provider').optional().trim(),
  queryValidator('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced', 'All Levels']),
  queryValidator('limit').optional().isInt({ min: 1, max: 50 }),
  queryValidator('offset').optional().isInt({ min: 0 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  const { q, provider, level, limit = 10, offset = 0 } = req.query;
  
  let results = [...mockCourses];

  // Filter by search query
  if (q) {
    const searchLower = q.toLowerCase();
    results = results.filter(course => 
      course.title.toLowerCase().includes(searchLower) ||
      course.description.toLowerCase().includes(searchLower) ||
      course.skills.some(skill => skill.toLowerCase().includes(searchLower))
    );
  }

  // Filter by provider
  if (provider) {
    results = results.filter(course => 
      course.provider.toLowerCase() === provider.toLowerCase()
    );
  }

  // Filter by level
  if (level) {
    results = results.filter(course => course.level === level);
  }

  // Apply pagination
  const total = results.length;
  results = results.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.json({
    courses: results,
    total,
    limit: parseInt(limit),
    offset: parseInt(offset),
    hasMore: parseInt(offset) + results.length < total
  });
}));

// Get course by ID
router.get('/:id', optionalAuth, [
  param('id').notEmpty().withMessage('Course ID is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  const course = mockCourses.find(c => c.id === req.params.id);
  
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  res.json({ course });
}));

// Get recommended courses based on user's goals
router.get('/recommended/for-me', authenticate, asyncHandler(async (req, res) => {
  // Get user's goal categories
  const result = await query(
    `SELECT DISTINCT category FROM goals WHERE user_id = $1 AND category IS NOT NULL`,
    [req.user.id]
  );
  
  const categories = result.rows.map(r => r.category.toLowerCase());
  
  // Find courses matching user's interests
  let recommended = mockCourses.filter(course => {
    const courseText = `${course.title} ${course.description} ${course.skills.join(' ')}`.toLowerCase();
    return categories.some(cat => courseText.includes(cat));
  });

  // If no matches, return top-rated courses
  if (recommended.length === 0) {
    recommended = [...mockCourses].sort((a, b) => b.rating - a.rating).slice(0, 4);
  }

  res.json({
    courses: recommended.slice(0, 6),
    basedOn: categories
  });
}));

// Save a course for later
router.post('/:id/save', authenticate, [
  param('id').notEmpty().withMessage('Course ID is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  const course = mockCourses.find(c => c.id === req.params.id);
  
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  // Save to database
  await query(
    `INSERT INTO saved_courses (user_id, external_id, title, provider, url, thumbnail_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id, external_id) DO NOTHING
     RETURNING *`,
    [req.user.id, course.id, course.title, course.provider, course.url, course.thumbnailUrl]
  );

  res.json({
    message: 'Course saved successfully',
    course
  });
}));

// Get saved courses
router.get('/saved/list', authenticate, asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT * FROM saved_courses WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.user.id]
  );

  res.json({
    savedCourses: result.rows,
    count: result.rows.length
  });
}));

// Remove saved course
router.delete('/:id/unsave', authenticate, [
  param('id').notEmpty().withMessage('Course ID is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  const result = await query(
    `DELETE FROM saved_courses WHERE user_id = $1 AND external_id = $2 RETURNING id`,
    [req.user.id, req.params.id]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, 'Saved course not found');
  }

  res.json({
    message: 'Course removed from saved list'
  });
}));

export default router;
