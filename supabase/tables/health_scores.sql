CREATE TABLE health_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    sleep_score DECIMAL(5,2),
    exercise_score DECIMAL(5,2),
    nutrition_score DECIMAL(5,2),
    water_score DECIMAL(5,2),
    total_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id,
    date)
);