import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const apiBaseUrl =
    (import.meta.env.VITE_API_URL || '').trim() ||
    (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const apiRequest = async (path: string, options?: RequestInit) => {
    const response = await fetch(`${apiBaseUrl}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
        },
        ...options,
    });

    let payload: any = null;
    try {
        payload = await response.json();
    } catch {
        payload = null;
    }

    if (!response.ok) {
        const message = payload?.error || payload?.message || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return payload;
};

// Database helper functions
export const createMeeting = async (hostId: string, hostName: string, title?: string) => {
    return apiRequest('/api/meetings/create', {
        method: 'POST',
        body: JSON.stringify({ hostId, hostName, title }),
    });
};

export const getMeeting = async (meetingId: string) => {
    return apiRequest(`/api/meetings/${meetingId}`);
};

export const joinMeetingByCode = async (inviteCode: string) => {
    return apiRequest('/api/meetings/join-by-code', {
        method: 'POST',
        body: JSON.stringify({ inviteCode }),
    });
};

export const endMeeting = async (meetingId: string, hostId: string) => {
    return apiRequest(`/api/meetings/${meetingId}/end`, {
        method: 'POST',
        body: JSON.stringify({ hostId }),
    });
};

export const getUserMeetings = async (userId: string) => {
    return apiRequest(`/api/meetings/user/${userId}`);
};

export const addMeetingParticipant = async (meetingId: string, userId: string, userName: string) => {
    return apiRequest(`/api/meetings/${meetingId}/participants`, {
        method: 'POST',
        body: JSON.stringify({ userId, userName }),
    });
};

export const updateParticipantLeftTime = async (meetingId: string, userId: string) => {
    return apiRequest(`/api/meetings/${meetingId}/participants/${userId}/leave`, {
        method: 'POST',
    });
};
