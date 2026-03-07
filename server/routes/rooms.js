import { createClient } from '@supabase/supabase-js';
import express from 'express';

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

// Get or create voice channel
router.post('/voice-channel', async (req, res) => {
    try {
        const { channelName, userId, userName } = req.body;

        // Check if channel exists
        let { data: channel, error } = await supabase
            .from('voice_channels')
            .select('*')
            .eq('name', channelName)
            .single();

        // Create channel if it doesn't exist
        if (!channel) {
            const insertResult = await supabase
                .from('voice_channels')
                .insert([
                    {
                        name: channelName,
                        created_by: userId,
                        created_at: new Date().toISOString(),
                        is_active: true,
                    },
                ])
                .select()
                .single();

            if (insertResult.error) throw insertResult.error;
            channel = insertResult.data;
        }

        res.json({ success: true, channel });
    } catch (error) {
        console.error('Error accessing voice channel:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to access voice channel'
        });
    }
});

// Get active voice channels
router.get('/voice-channels', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('voice_channels')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, channels: data || [] });
    } catch (error) {
        console.error('Error fetching voice channels:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch voice channels'
        });
    }
});

export default router;
