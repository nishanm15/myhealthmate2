-- Migration: add_rls_policies_for_new_features
-- Created at: 1762144448

-- Enable RLS on all new tables
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;

-- Water Logs Policies
CREATE POLICY "Users can view their own water logs"
  ON water_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own water logs"
  ON water_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own water logs"
  ON water_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water logs"
  ON water_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Achievements Policies (public read)
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  USING (true);

-- User Achievements Policies
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- Streaks Policies
CREATE POLICY "Users can view their own streaks"
  ON streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
  ON streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
  ON streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Health Scores Policies
CREATE POLICY "Users can view their own health scores"
  ON health_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health scores"
  ON health_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health scores"
  ON health_scores FOR UPDATE
  USING (auth.uid() = user_id);

-- Mood Logs Policies
CREATE POLICY "Users can view their own mood logs"
  ON mood_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood logs"
  ON mood_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood logs"
  ON mood_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood logs"
  ON mood_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_water_logs_user_date ON water_logs(user_id, date);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_streaks_user ON streaks(user_id);
CREATE INDEX idx_health_scores_user_date ON health_scores(user_id, date);
CREATE INDEX idx_mood_logs_user_date ON mood_logs(user_id, date);;