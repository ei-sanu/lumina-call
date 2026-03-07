import { createClient } from '@supabase/supabase-js';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

// Create a new meeting
router.post('/create', async (req, res) => {
    try {
        const { hostId, hostName, title, isScheduled, scheduledTime } = req.body;

        const meetingId = uuidv4();
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const { data, error } = await supabase
            .from('meetings')
            .insert([
                {
                    id: meetingId,
                    host_id: hostId,
                    host_name: hostName,
                    title: title || 'Untitled Meeting',
                    invite_code: inviteCode,
                    is_scheduled: isScheduled || false,
                    scheduled_time: scheduledTime || null,
                    status: 'active',
                    created_at: new Date().toISOString(),
                },
            ])
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            meeting: data,
            joinUrl: `${process.env.CLIENT_URL}/meeting/${meetingId}`,
        });
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create meeting'
        });
    }
});

// Get meeting details
router.get('/:meetingId', async (req, res) => {
    try {
        const { meetingId } = req.params;

        const { data, error } = await supabase
            .from('meetings')
            .select('*')
            .eq('id', meetingId)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found'
            });
        }

        res.json({ success: true, meeting: data });
    } catch (error) {
        console.error('Error fetching meeting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch meeting'
        });
    }
});

// Join meeting by invite code
router.post('/join-by-code', async (req, res) => {
    try {
        const { inviteCode } = req.body;

        const { data, error } = await supabase
            .from('meetings')
            .select('*')
            .eq('invite_code', inviteCode.toUpperCase())
            .eq('status', 'active')
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                error: 'Invalid invite code'
            });
        }

        res.json({
            success: true,
            meeting: data,
            joinUrl: `${process.env.CLIENT_URL}/meeting/${data.id}`,
        });
    } catch (error) {
        console.error('Error joining meeting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to join meeting'
        });
    }
});

// End meeting
router.post('/:meetingId/end', async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { hostId } = req.body;

        // Verify host
        const { data: meeting } = await supabase
            .from('meetings')
            .select('host_id')
            .eq('id', meetingId)
            .single();

        if (!meeting || meeting.host_id !== hostId) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        const { error } = await supabase
            .from('meetings')
            .update({
                status: 'ended',
                ended_at: new Date().toISOString(),
            })
            .eq('id', meetingId);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Error ending meeting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to end meeting'
        });
    }
});

// Get user's meetings
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('meetings')
            .select('*')
            .eq('host_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        res.json({ success: true, meetings: data || [] });
    } catch (error) {
        console.error('Error fetching user meetings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch meetings'
        });
    }
});

export default router;
