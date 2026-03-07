import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helper functions
export const createMeeting = async (hostId: string, hostName: string, title?: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/meetings/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId, hostName, title }),
    });
    return response.json();
};

export const getMeeting = async (meetingId: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/meetings/${meetingId}`);
    return response.json();
};

export const joinMeetingByCode = async (inviteCode: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/meetings/join-by-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode }),
    });
    return response.json();
};

export const endMeeting = async (meetingId: string, hostId: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/meetings/${meetingId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId }),
    });
    return response.json();
};

export const getUserMeetings = async (userId: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/meetings/user/${userId}`);
    return response.json();
};

export const addMeetingParticipant = async (meetingId: string, userId: string, userName: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/meetings/${meetingId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName }),
    });
    return response.json();
};

export const updateParticipantLeftTime = async (meetingId: string, userId: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/meetings/${meetingId}/participants/${userId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
};
