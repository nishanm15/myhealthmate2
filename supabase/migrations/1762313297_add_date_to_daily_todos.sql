-- Migration: add_date_to_daily_todos
-- Created at: 1762313297

-- Add date column to todos table for daily tracking
ALTER TABLE todos ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;

-- Create index for efficient querying by user and date
CREATE INDEX IF NOT EXISTS idx_todos_user_date ON todos(user_id, date);

-- Update existing todos to have today's date if they don't have one
UPDATE todos SET date = CURRENT_DATE WHERE date IS NULL;

-- Set date as NOT NULL after populating existing records
ALTER TABLE todos ALTER COLUMN date SET NOT NULL;;