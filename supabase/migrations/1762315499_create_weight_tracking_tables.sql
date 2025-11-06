-- Migration: create_weight_tracking_tables
-- Created at: 1762315499

-- Create weight_entries table
CREATE TABLE IF NOT EXISTS weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg > 0 AND weight_kg < 500),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create weight_goals table
CREATE TABLE IF NOT EXISTS weight_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_weight_kg DECIMAL(5,2) NOT NULL CHECK (target_weight_kg > 0 AND target_weight_kg < 500),
  start_weight_kg DECIMAL(5,2) NOT NULL CHECK (start_weight_kg > 0 AND start_weight_kg < 500),
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_date ON weight_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_weight_goals_user_active ON weight_goals(user_id, is_active);

-- Enable Row Level Security
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for weight_entries
CREATE POLICY "Users can view own weight entries"
  ON weight_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight entries"
  ON weight_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight entries"
  ON weight_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight entries"
  ON weight_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for weight_goals
CREATE POLICY "Users can view own weight goals"
  ON weight_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight goals"
  ON weight_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight goals"
  ON weight_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight goals"
  ON weight_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_weight_entries_updated_at
  BEFORE UPDATE ON weight_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weight_goals_updated_at
  BEFORE UPDATE ON weight_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();;