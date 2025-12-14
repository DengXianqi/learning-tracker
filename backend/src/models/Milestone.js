import { query } from '../config/database.js';

export const Milestone = {
  // Find all milestones for a goal
  async findByGoalId(goalId) {
    const result = await query(
      'SELECT * FROM milestones WHERE goal_id = $1 ORDER BY order_index, created_at',
      [goalId]
    );
    return result.rows;
  },

  // Find single milestone by ID
  async findById(id) {
    const result = await query(
      'SELECT * FROM milestones WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Create new milestone
  async create({ goalId, title, description, orderIndex }) {
    // Get the next order index if not provided
    if (orderIndex === undefined) {
      const maxOrderResult = await query(
        'SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM milestones WHERE goal_id = $1',
        [goalId]
      );
      orderIndex = maxOrderResult.rows[0].next_order;
    }

    const result = await query(
      `INSERT INTO milestones (goal_id, title, description, order_index)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [goalId, title, description, orderIndex]
    );
    return result.rows[0];
  },

  // Update milestone
  async update(id, { title, description, orderIndex }) {
    const result = await query(
      `UPDATE milestones 
       SET title = COALESCE($2, title),
           description = COALESCE($3, description),
           order_index = COALESCE($4, order_index)
       WHERE id = $1
       RETURNING *`,
      [id, title, description, orderIndex]
    );
    return result.rows[0] || null;
  },

  // Mark milestone as complete
  async complete(id) {
    const result = await query(
      `UPDATE milestones 
       SET completed = true, completed_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Mark milestone as incomplete
  async uncomplete(id) {
    const result = await query(
      `UPDATE milestones 
       SET completed = false, completed_at = NULL
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Toggle milestone completion
  async toggleComplete(id) {
    const milestone = await this.findById(id);
    if (!milestone) return null;
    
    return milestone.completed ? this.uncomplete(id) : this.complete(id);
  },

  // Delete milestone
  async delete(id) {
    const result = await query(
      'DELETE FROM milestones WHERE id = $1 RETURNING id, goal_id',
      [id]
    );
    return result.rows[0] || null;
  },

  // Reorder milestones
  async reorder(goalId, milestoneIds) {
    const client = await query.getClient?.() || { query: query };
    
    try {
      if (client.query !== query) await client.query('BEGIN');
      
      for (let i = 0; i < milestoneIds.length; i++) {
        await (client.query !== query ? client : { query }).query(
          'UPDATE milestones SET order_index = $1 WHERE id = $2 AND goal_id = $3',
          [i, milestoneIds[i], goalId]
        );
      }
      
      if (client.query !== query) await client.query('COMMIT');
      return true;
    } catch (error) {
      if (client.query !== query) await client.query('ROLLBACK');
      throw error;
    } finally {
      if (client.release) client.release();
    }
  },

  // Get goal ID for a milestone (for authorization checks)
  async getGoalId(milestoneId) {
    const result = await query(
      'SELECT goal_id FROM milestones WHERE id = $1',
      [milestoneId]
    );
    return result.rows[0]?.goal_id || null;
  },

  // Bulk create milestones
  async bulkCreate(goalId, milestones) {
    const results = [];
    for (let i = 0; i < milestones.length; i++) {
      const milestone = await this.create({
        goalId,
        title: milestones[i].title,
        description: milestones[i].description,
        orderIndex: i
      });
      results.push(milestone);
    }
    return results;
  }
};

export default Milestone;
