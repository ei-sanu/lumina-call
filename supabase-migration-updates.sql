-- Migration to add indexes, RLS policies, and constraints to existing tables
-- Run this in Supabase SQL Editor to update your existing schema

-- Add performance indexes (IF NOT EXISTS prevents errors if already created)
CREATE INDEX IF NOT EXISTS idx_meetings_host_id ON public.meetings (host_id);

CREATE INDEX IF NOT EXISTS idx_meetings_invite_code ON public.meetings (invite_code);

CREATE INDEX IF NOT EXISTS idx_meetings_status ON public.meetings (status);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON public.meeting_participants (meeting_id);

-- Enable Row Level Security (RLS) if not already enabled
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.voice_channels ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate with correct names)
DROP POLICY IF EXISTS "Meetings are viewable by everyone" ON public.meetings;

DROP POLICY IF EXISTS "Users can create meetings" ON public.meetings;

DROP POLICY IF EXISTS "Only host can update meeting" ON public.meetings;

DROP POLICY IF EXISTS "Voice channels are viewable by everyone" ON public.voice_channels;

DROP POLICY IF EXISTS "Users can create voice channels" ON public.voice_channels;

DROP POLICY IF EXISTS "Meeting participants are viewable by everyone" ON public.meeting_participants;

DROP POLICY IF EXISTS "Users can join meetings" ON public.meeting_participants;

-- Create RLS Policies
CREATE POLICY "Meetings are viewable by everyone" ON public.meetings FOR
SELECT USING (true);

CREATE POLICY "Users can create meetings" ON public.meetings FOR
INSERT
WITH
    CHECK (true);

CREATE POLICY "Only host can update meeting"
ON public.meetings
FOR UPDATE
USING (host_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Voice channels are viewable by everyone" ON public.voice_channels FOR
SELECT USING (true);

CREATE POLICY "Users can create voice channels" ON public.voice_channels FOR
INSERT
WITH
    CHECK (true);

CREATE POLICY "Meeting participants are viewable by everyone" ON public.meeting_participants FOR
SELECT USING (true);

CREATE POLICY "Users can join meetings" ON public.meeting_participants FOR
INSERT
WITH
    CHECK (true);

-- Update foreign key constraint to include ON DELETE CASCADE
-- First, drop the existing constraint
ALTER TABLE public.meeting_participants
DROP CONSTRAINT IF EXISTS meeting_participants_meeting_id_fkey;

-- Recreate with ON DELETE CASCADE
ALTER TABLE public.meeting_participants
ADD CONSTRAINT meeting_participants_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.meetings (id) ON DELETE CASCADE;
