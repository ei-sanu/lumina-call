import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatMessage, Participant } from '@/types/meeting';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, MessageSquare, Send, Smile, ThumbsUp, Users, X } from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    messages: ChatMessage[];
    onSendMessage: (message: string, recipientId?: string) => void;
    currentUserId: string;
    participants: Participant[];
}

export const ChatPanel: FC<ChatPanelProps> = ({
    isOpen,
    onClose,
    messages,
    onSendMessage,
    currentUserId,
    participants,
}) => {
    const [inputMessage, setInputMessage] = useState('');
    const [activeTab, setActiveTab] = useState<'everyone' | 'dm'>('everyone');
    const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [messageReactions, setMessageReactions] = useState<Record<string, string[]>>({});
    const scrollRef = useRef<HTMLDivElement>(null);

    const commonEmojis = ['😊', '👍', '❤️', '😂', '🎉', '🔥', '👏', '✨'];

    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, isOpen]);

    const handleSend = () => {
        if (inputMessage.trim()) {
            const recipientId = activeTab === 'dm' ? selectedRecipient || undefined : undefined;
            onSendMessage(inputMessage.trim(), recipientId);
            setInputMessage('');
            setShowEmojiPicker(false);
        }
    };

    const handleEmojiClick = (emoji: string) => {
        setInputMessage(prev => prev + emoji);
    };

    const handleReaction = (messageId: string, reaction: string) => {
        setMessageReactions(prev => ({
            ...prev,
            [messageId]: [...(prev[messageId] || []), reaction]
        }));
    };

    const getFilteredMessages = () => {
        if (activeTab === 'everyone') {
            return messages.filter(msg => !msg.recipientId);
        } else {
            return messages.filter(msg =>
                (msg.userId === selectedRecipient && msg.recipientId === currentUserId) ||
                (msg.userId === currentUserId && msg.recipientId === selectedRecipient)
            );
        }
    };

    const filteredMessages = getFilteredMessages();

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-4 top-24 bottom-32 w-[90vw] sm:w-96 bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl z-50 rounded-2xl flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-purple-400" />
                            <h3 className="text-white font-bold text-lg">Meeting Chat</h3>
                        </div>
                        <Button
                            onClick={onClose}
                            size="icon"
                            variant="ghost"
                            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'everyone' | 'dm')} className="flex-1 flex flex-col min-h-0">
                        <TabsList className="mx-4 mt-4 bg-white/5 border border-white/10 p-1">
                            <TabsTrigger value="everyone" className="flex-1 flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-white transition-all">
                                <Users className="w-4 h-4" />
                                Everyone
                            </TabsTrigger>
                            <TabsTrigger value="dm" className="flex-1 flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-white transition-all">
                                <MessageSquare className="w-4 h-4" />
                                Private
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="everyone" className="flex-1 flex flex-col min-h-0 mt-2">
                            <ScrollArea className="flex-1 px-4" ref={scrollRef}>
                                <div className="space-y-4 py-4">
                                    {filteredMessages.length === 0 ? (
                                        <div className="text-center text-gray-500 mt-20">
                                            <p className="font-medium">No messages yet</p>
                                            <p className="text-xs mt-1">Chat history will appear here</p>
                                        </div>
                                    ) : (
                                        filteredMessages.map((msg) => {
                                            const isOwn = msg.userId === currentUserId;
                                            return (
                                                <motion.div
                                                    key={msg.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                                                >
                                                    {!isOwn && (
                                                        <span className="text-[10px] font-bold text-purple-400 mb-1 px-1 uppercase tracking-wider">
                                                            {msg.userName}
                                                        </span>
                                                    )}
                                                    <div className="group relative max-w-[85%]">
                                                        <div
                                                            className={`rounded-2xl px-4 py-2 transition-all ${isOwn
                                                                    ? 'bg-purple-600/30 border border-purple-500/30 text-white'
                                                                    : 'bg-white/10 border border-white/10 text-gray-100'
                                                                }`}
                                                        >
                                                            <p className="text-sm break-words leading-relaxed">{msg.message}</p>
                                                            <span className="text-[10px] opacity-50 mt-1 block">
                                                                {formatTime(msg.timestamp)}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Reactions */}
                                                        <div className={`absolute top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ${isOwn ? '-left-12' : '-right-12'}`}>
                                                            <button onClick={() => handleReaction(msg.id, '❤️')} className="hover:scale-125 transition-transform">❤️</button>
                                                            <button onClick={() => handleReaction(msg.id, '👍')} className="hover:scale-125 transition-transform">👍</button>
                                                        </div>
                                                        
                                                        {messageReactions[msg.id] && (
                                                            <div className="flex gap-1 mt-1">
                                                                {Array.from(new Set(messageReactions[msg.id])).map((reaction, idx) => (
                                                                    <span key={idx} className="text-[10px] bg-white/10 rounded-full px-1.5 py-0.5">
                                                                        {reaction} {messageReactions[msg.id].filter(r => r === reaction).length}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="dm" className="flex-1 flex flex-col min-h-0 mt-2">
                            {!selectedRecipient ? (
                                <div className="flex-1 p-4 overflow-y-auto">
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Select Participant</p>
                                    <div className="space-y-2">
                                        {participants.filter(p => p.userId !== currentUserId).map((participant) => (
                                            <button
                                                key={participant.userId}
                                                onClick={() => setSelectedRecipient(participant.userId)}
                                                className="w-full p-3 bg-white/5 hover:bg-purple-500/20 border border-white/10 rounded-xl transition-all text-left flex items-center gap-3"
                                            >
                                                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {participant.userName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-bold">{participant.userName}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase">{participant.isHost ? 'Host' : 'Participant'}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col min-h-0">
                                    <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between bg-white/5">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => setSelectedRecipient(null)} className="h-8 w-8 rounded-full">
                                                <Users className="w-4 h-4" />
                                            </Button>
                                            <span className="text-white font-bold text-sm">
                                                {participants.find(p => p.userId === selectedRecipient)?.userName}
                                            </span>
                                        </div>
                                    </div>
                                    <ScrollArea className="flex-1 px-4" ref={scrollRef}>
                                        <div className="space-y-4 py-4">
                                            {filteredMessages.map((msg) => (
                                                <div key={msg.id} className={`flex flex-col ${msg.userId === currentUserId ? 'items-end' : 'items-start'}`}>
                                                    <div className={`rounded-2xl px-4 py-2 ${msg.userId === currentUserId ? 'bg-purple-600/30 border border-purple-500/30' : 'bg-white/10 border border-white/10'}`}>
                                                        <p className="text-sm text-white">{msg.message}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </TabsContent>

                        {/* Input */}
                        <div className="p-4 bg-white/5 border-t border-white/10">
                            <div className="flex flex-col gap-2">
                                {showEmojiPicker && (
                                    <div className="flex gap-2 p-2 bg-black/40 rounded-xl border border-white/10 justify-around">
                                        {commonEmojis.map((emoji) => (
                                            <button key={emoji} onClick={() => handleEmojiClick(emoji)} className="text-xl hover:scale-125 transition-transform">{emoji}</button>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        size="icon"
                                        variant="ghost"
                                        className="h-10 w-10 text-gray-400 hover:text-white rounded-xl"
                                    >
                                        <Smile className="w-5 h-5" />
                                    </Button>
                                    <Input
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Message..."
                                        className="bg-white/5 border-white/10 h-11 text-sm rounded-xl focus-visible:ring-purple-500"
                                    />
                                    <Button
                                        onClick={handleSend}
                                        size="icon"
                                        className="h-11 w-11 bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/20"
                                        disabled={!inputMessage.trim()}
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Tabs>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
