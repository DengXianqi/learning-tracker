import { query } from '../config/database.js';

export const Goal = {
  // Find all goals for a user
  async findByUserId(userId, { status, limit, offset } = {}) {
    let sql = `
      SELECT g.*, 
        COUNT(m.id) as milestone_count,
        COUNT(m.id) FILTER (WHERE m.completed = true) as completed_milestone_count
      FROM goals g
      LEFT JOIN milestones m ON g.id = m.goal_id
      WHERE g.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (status) {
      sql += ` AND g.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ' GROUP BY g.id ORDER BY g.created_at DESC';

    if (limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(limit);
      paramIndex++;
    }

    if (offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(offset);
    }

    const result = await query(sql, params);
    return result.rows;
  },

  // Find single goal by ID
  async findById(id) {
    const result = await query(
      `SELECT g.*, 
        COUNT(m.id) as milestone_count,
        COUNT(m.id) FILTER (WHERE m.completed = true) as completed_milestone_count
       FROM goals g
       LEFT JOIN milestones m ON g.id = m.goal_id
       WHERE g.id = $1
       GROUP BY g.id`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Find goal with milestones
  async findByIdWithMilestones(id) {
    const goalResult = await query(
      'SELECT * FROM goals WHERE id = $1',
      [id]
    );
    
    if (goalResult.rows.length === 0) return null;

    const milestonesResult = await query(
      'SELECT * FROM milestones WHERE goal_id = $1 ORDER BY order_index, created_at',
      [id]
    );

    return {
      ...goalResult.rows[0],
      milestones: milestonesResult.rows
    };
  },

  // Create new goal
  async create({ userId, title, description, category, targetDate }) {
    const result = await query(
      `INSERT INTO goals (user_id, title, description, category, target_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title, description, category, targetDate]
    );
    return result.rows[0];
  },

  // Update goal
  async update(id, { title, description, category, targetDate, status }) {
    const result = await query(
      `UPDATE goals 
       SET title = COALESCE($2, title),
           description = COALESCE($3, description),
           category = COALESCE($4, category),
           target_date = COALESCE($5, target_date),
           status = COALESCE($6, status)
       WHERE id = $1
       RETURNING *`,
      [id, title, description, category, targetDate, status]
    );
    return result.rows[0] || null;
  },

  // Delete goal (cascades to milestones)
  async delete(id) {
    const result = await query(
      'DELETE FROM goals WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount > 0;
  },

  // Check if user owns goal
  async isOwner(goalId, userId) {
    const result = await query(
      'SELECT id FROM goals WHERE id = $1 AND user_id = $2',
      [goalId, userId]
    );
    return result.rows.length > 0;
  },

  // Get goal statistics for user
  async getStatsByUserId(userId) {
    const result = await query(
      `SELECT 
        status,
        COUNT(*) as count,
        AVG(progress) as avg_progress
       FROM goals
       WHERE user_id = $1
       GROUP BY status`,
      [userId]
    );
    return result.rows;
  },

  // Get goals by category
  async getByCategory(userId) {
    const result = await query(
      `SELECT 
        category,
        COUNT(*) as count,
        AVG(progress) as avg_progress
       FROM goals
       WHERE user_id = $1 AND category IS NOT NULL
       GROUP BY category
       ORDER BY count DESC`,
      [userId]
    );
    return result.rows;
  },

  // Get recent activity
  async getRecentActivity(userId, limit = 10) {
    const result = await query(
      `SELECT 
        'goal' as type,
        g.id,
        g.title,
        g.status,
        g.updated_at as activity_date
       FROM goals g
       WHERE g.user_id = $1
       UNION ALL
       SELECT 
        'milestone' as type,
        m.id,
        m.title,
        CASE WHEN m.completed THEN 'completed' ELSE 'pending' END as status,
        COALESCE(m.completed_at, m.updated_at) as activity_date
       FROM milestones m
       JOIN goals g ON m.goal_id = g.id
       WHERE g.user_id = $1
       ORDER BY activity_date DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }
};

export default Goal;
