import { query } from '../config/database.js';

export const User = {
  // Find user by ID
  async findById(id) {
    const result = await query(
      'SELECT id, google_id, email, name, avatar_url, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Find user by Google ID
  async findByGoogleId(googleId) {
    const result = await query(
      'SELECT id, google_id, email, name, avatar_url, created_at FROM users WHERE google_id = $1',
      [googleId]
    );
    return result.rows[0] || null;
  },

  // Find user by email
  async findByEmail(email) {
    const result = await query(
      'SELECT id, google_id, email, name, avatar_url, created_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  // Create new user
  async create({ googleId, email, name, avatarUrl }) {
    const result = await query(
      `INSERT INTO users (google_id, email, name, avatar_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, google_id, email, name, avatar_url, created_at`,
      [googleId, email, name, avatarUrl]
    );
    return result.rows[0];
  },

  // Update user
  async update(id, { name, avatarUrl }) {
    const result = await query(
      `UPDATE users 
       SET name = COALESCE($2, name), avatar_url = COALESCE($3, avatar_url)
       WHERE id = $1
       RETURNING id, google_id, email, name, avatar_url, created_at`,
      [id, name, avatarUrl]
    );
    return result.rows[0] || null;
  },

  // Find or create user (upsert for OAuth)
  async findOrCreate({ googleId, email, name, avatarUrl }) {
    let user = await this.findByGoogleId(googleId);
    
    if (user) {
      // Update user info on login
      user = await this.update(user.id, { name, avatarUrl });
    } else {
      // Create new user
      user = await this.create({ googleId, email, name, avatarUrl });
    }
    
    return user;
  },

  // Get user stats
  async getStats(userId) {
    const result = await query(
      `SELECT 
        (SELECT COUNT(*) FROM goals WHERE user_id = $1) as total_goals,
        (SELECT COUNT(*) FROM goals WHERE user_id = $1 AND status = 'completed') as completed_goals,
        (SELECT COUNT(*) FROM milestones m JOIN goals g ON m.goal_id = g.id WHERE g.user_id = $1) as total_milestones,
        (SELECT COUNT(*) FROM milestones m JOIN goals g ON m.goal_id = g.id WHERE g.user_id = $1 AND m.completed = true) as completed_milestones`,
      [userId]
    );
    return result.rows[0];
  }
};

export default User;
