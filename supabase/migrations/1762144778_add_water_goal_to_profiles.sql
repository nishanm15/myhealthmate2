-- Migration: add_water_goal_to_profiles
-- Created at: 1762144778

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS water_goal INTEGER DEFAULT 2000;;