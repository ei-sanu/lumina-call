-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    host_id VARCHAR(255) NOT NULL,
    host_name VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    invite_code VARCHAR(10) UNIQUE NOT NULL,
    is_scheduled BOOLEAN DEFAULT false,
    scheduled_time TIMESTAMP
    WITH
        TIME ZONE,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        ended_at TIMESTAMP
    WITH
        TIME ZONE
);

-- Voice channels table
CREATE TABLE IF NOT EXISTS voice_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(255) UNIQUE NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Meeting participants (for tracking)
CREATE TABLE IF NOT EXISTS meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    meeting_id UUID REFERENCES meetings (id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        left_at TIMESTAMP
    WITH
        TIME ZONE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meetings_host_id ON meetings (host_id);

CREATE INDEX IF NOT EXISTS idx_meetings_invite_code ON meetings (invite_code);

CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings (status);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants (meeting_id);

-- Enable Row Level Security (RLS)
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

ALTER TABLE voice_channels ENABLE ROW LEVEL SECURITY;

ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

-- Policies (adjust based on your Clerk setup)
CREATE POLICY "Meetings are viewable by everyone" ON meetings FOR
SELECT USING (true);

CREATE POLICY "Users can create meetings" ON meetings FOR
INSERT
WITH
    CHECK (true);

CREATE POLICY "Only host can update meeting" ON meetings
    FOR UPDATE USING (host_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Voice channels are viewable by everyone" ON voice_channels FOR
SELECT USING (true);

CREATE POLICY "Users can create voice channels" ON voice_channels FOR
INSERT
WITH
    CHECK (true);

CREATE POLICY "Meeting participants are viewable by everyone" ON meeting_participants FOR
SELECT USING (true);

CREATE POLICY "Users can join meetings" ON meeting_participants FOR
INSERT
WITH
    CHECK (true);
