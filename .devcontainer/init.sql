-- Database initialization script for Learning Progress Tracker

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  target_date DATE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id SERIAL PRIMARY KEY,
  goal_id INTEGER REFERENCES goals(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create courses table (for saved courses from external API)
CREATE TABLE IF NOT EXISTS saved_courses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  external_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  provider VARCHAR(100),
  url TEXT,
  thumbnail_url TEXT,
  goal_id INTEGER REFERENCES goals(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, external_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_milestones_goal_id ON milestones(goal_id);
CREATE INDEX idx_milestones_completed ON milestones(completed);
CREATE INDEX idx_saved_courses_user_id ON saved_courses(user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate and update goal progress based on milestones
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_milestones INTEGER;
  completed_milestones INTEGER;
  new_progress INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE completed = TRUE)
  INTO total_milestones, completed_milestones
  FROM milestones
  WHERE goal_id = COALESCE(NEW.goal_id, OLD.goal_id);
  
  IF total_milestones > 0 THEN
    new_progress := (completed_milestones * 100) / total_milestones;
  ELSE
    new_progress := 0;
  END IF;
  
  UPDATE goals
  SET progress = new_progress
  WHERE id = COALESCE(NEW.goal_id, OLD.goal_id);
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update goal progress when milestones change
CREATE TRIGGER update_goal_progress_on_milestone_change
  AFTER INSERT OR UPDATE OR DELETE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_progress();
