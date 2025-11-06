-- Journal System Database Schema for MyHealthMate
-- Created: November 5, 2025
-- Purpose: Comprehensive journal/diary system with analytics and weight tracking integration

-- ============================================================
-- TABLE: journal_entries
-- Purpose: Store user journal entries with rich text content
-- ============================================================

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  word_count INTEGER DEFAULT 0,
  is_linked_to_weight BOOLEAN DEFAULT false,
  weight_entry_id UUID,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_mood ON journal_entries(user_id, mood_rating);
CREATE INDEX IF NOT EXISTS idx_journal_entries_weight_link ON journal_entries(user_id, is_linked_to_weight);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON journal_entries USING GIN(tags);

-- ============================================================
-- TABLE: journal_analytics
-- Purpose: Store aggregated analytics data for performance
-- ============================================================

CREATE TABLE IF NOT EXISTS journal_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  entry_count INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  average_mood DECIMAL(3,2),
  average_energy DECIMAL(3,2),
  writing_streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_journal_analytics_user_date ON journal_analytics(user_id, date DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on both tables
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean re-run)
DROP POLICY IF EXISTS "Users can view their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can view their own analytics" ON journal_analytics;
DROP POLICY IF EXISTS "Users can insert their own analytics" ON journal_analytics;
DROP POLICY IF EXISTS "Users can update their own analytics" ON journal_analytics;
DROP POLICY IF EXISTS "Users can delete their own analytics" ON journal_analytics;

-- RLS Policies for journal_entries
CREATE POLICY "Users can view their own journal entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for journal_analytics
CREATE POLICY "Users can view their own analytics"
  ON journal_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics"
  ON journal_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics"
  ON journal_analytics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics"
  ON journal_analytics FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================

-- Function to update word count automatically
CREATE OR REPLACE FUNCTION update_journal_word_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate word count from content (simple space-based count)
  NEW.word_count := array_length(string_to_array(trim(NEW.content), ' '), 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update word count before insert or update
DROP TRIGGER IF EXISTS trigger_update_word_count ON journal_entries;
CREATE TRIGGER trigger_update_word_count
  BEFORE INSERT OR UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_journal_word_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on journal_entries
DROP TRIGGER IF EXISTS trigger_journal_entries_updated_at ON journal_entries;
CREATE TRIGGER trigger_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on journal_analytics
DROP TRIGGER IF EXISTS trigger_journal_analytics_updated_at ON journal_analytics;
CREATE TRIGGER trigger_journal_analytics_updated_at
  BEFORE UPDATE ON journal_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- COMPLETION MESSAGE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE 'Journal database schema created successfully!';
  RAISE NOTICE 'Tables created: journal_entries, journal_analytics';
  RAISE NOTICE 'Indexes created: 7 indexes for optimal query performance';
  RAISE NOTICE 'RLS policies: 8 policies (4 per table)';
  RAISE NOTICE 'Triggers: 3 triggers (word count, updated_at timestamps)';
END $$;
