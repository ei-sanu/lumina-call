export interface Participant {
    userId: string;
    userName: string;
    socketId: string;
    audioEnabled: boolean;
    videoEnabled: boolean;
    screenSharing: boolean;
    handRaised: boolean;
    isHost: boolean;
    stream?: MediaStream;
    screenStream?: MediaStream;
}

export interface Meeting {
    id: string;
    host_id: string;
    host_name: string;
    title: string;
    invite_code: string;
    is_scheduled: boolean;
    scheduled_time?: string;
    status: 'active' | 'ended' | 'scheduled';
    created_at: string;
    ended_at?: string;
}

export interface ChatMessage {
    id: string;
    userId: string;
    userName: string;
    message: string;
    timestamp: number;
}

export interface VoiceChannel {
    id: string;
    name: string;
    created_by: string;
    created_at: string;
    is_active: boolean;
    participant_count?: number;
}

export interface PeerConnection {
    peerId: string;
    connection: RTCPeerConnection;
    stream?: MediaStream;
}

export interface MediaDevices {
    audioInputs: MediaDeviceInfo[];
    audioOutputs: MediaDeviceInfo[];
    videoInputs: MediaDeviceInfo[];
}
