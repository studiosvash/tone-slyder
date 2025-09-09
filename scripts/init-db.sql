-- Tone Slyder Database Initialization
-- This script sets up the initial database schema

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    tier VARCHAR(50) DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- User usage tracking
CREATE TABLE IF NOT EXISTS user_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- Format: 2024-01
    rewrites_count INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    cost_usd DECIMAL(10,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month_year)
);

-- Presets table
CREATE TABLE IF NOT EXISTS presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    slider_values JSONB NOT NULL,
    guardrails JSONB,
    tags TEXT[],
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Custom sliders table
CREATE TABLE IF NOT EXISTS custom_sliders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    instruction_mappings JSONB NOT NULL,
    tags TEXT[],
    rating_avg DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rewrite history (optional - for user history tracking)
CREATE TABLE IF NOT EXISTS rewrite_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_text TEXT NOT NULL,
    rewritten_text TEXT NOT NULL,
    slider_values JSONB NOT NULL,
    model_used VARCHAR(100),
    tokens_used INTEGER,
    cost_usd DECIMAL(8,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);
CREATE INDEX IF NOT EXISTS idx_user_usage_month ON user_usage(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_presets_user ON presets(user_id);
CREATE INDEX IF NOT EXISTS idx_presets_public ON presets(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_custom_sliders_creator ON custom_sliders(creator_id);
CREATE INDEX IF NOT EXISTS idx_custom_sliders_public ON custom_sliders(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_rewrite_history_user ON rewrite_history(user_id);
CREATE INDEX IF NOT EXISTS idx_rewrite_history_created ON rewrite_history(created_at);

-- Insert some default presets
INSERT INTO presets (id, name, description, user_id, is_public, slider_values, guardrails, tags) VALUES 
(uuid_generate_v4(), 'Business Email', 'Professional tone for business communications', NULL, TRUE, 
 '{"formality": 70, "conversational": 40, "informativeness": 60, "authoritativeness": 65}', 
 '{"required": [], "banned": ["um", "like", "totally"]}', 
 ARRAY['business', 'professional', 'email']),
(uuid_generate_v4(), 'Academic Writing', 'Formal academic tone for research papers', NULL, TRUE,
 '{"formality": 85, "conversational": 20, "informativeness": 80, "authoritativeness": 75}',
 '{"required": [], "banned": ["I think", "maybe", "probably"]}',
 ARRAY['academic', 'research', 'formal']),
(uuid_generate_v4(), 'Social Media', 'Casual and engaging tone for social posts', NULL, TRUE,
 '{"formality": 30, "conversational": 75, "informativeness": 45, "authoritativeness": 40}',
 '{"required": [], "banned": []}',
 ARRAY['social', 'casual', 'engaging']);

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON user_usage 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_presets_updated_at BEFORE UPDATE ON presets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_sliders_updated_at BEFORE UPDATE ON custom_sliders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
