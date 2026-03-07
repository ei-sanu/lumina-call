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
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const commonEmojis = ['😊', '👍', '❤️', '😂', '🎉', '🔥', '👏', '✨'];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

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

    const getUnreadCount = () => {
        // Placeholder - would track last read message in real implementation
        return 0;
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
                    className="fixed right-0 top-0 bottom-0 w-96 bg-black/30 backdrop-blur-xl border-l border-white/10 shadow-2xl z-40 flex flex-col"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 font-semibold text-lg">
                            Meeting Chat
                        </h3>
                        {getUnreadCount() > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {getUnreadCount()}
                            </Badge>
                        )}
                        <Button
                            onClick={onClose}
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'everyone' | 'dm')} className="flex-1 flex flex-col">
                        <TabsList className="m-4 mb-0 bg-white/5 border border-white/10">
                            <TabsTrigger value="everyone" className="flex items-center gap-2 data-[state=active]:bg-purple-500/20">
                                <Users className="w-4 h-4" />
                                Everyone
                            </TabsTrigger>
                            <TabsTrigger value="dm" className="flex items-center gap-2 data-[state=active]:bg-purple-500/20">
                                <MessageSquare className="w-4 h-4" />
                                Direct
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="everyone" className="flex-1 flex flex-col mt-0">
                            {/* Everyone Chat Messages */}
                            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                                <div className="space-y-4">
                                    {filteredMessages.length === 0 ? (
                                        <div className="text-center text-gray-400 mt-8">
                                            <p>No messages yet</p>
                                            <p className="text-sm mt-1">Be the first to say hello!</p>
                                        </div>
                                    ) : (
                                        filteredMessages.map((msg) => {
                                            const isOwn = msg.userId === currentUserId;
                                            return (
                                                <motion.div
                                                    key={msg.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                                                >
                                                    {!isOwn && (
                                                        <span className="text-xs text-gray-400 mb-1 px-1">
                                                            {msg.userName}
                                                        </span>
                                                    )}
                                                    <div className="group relative">
                                                        <div
                                                            className={`max-w-[80%] rounded-lg px-3 py-2 transition-all hover:shadow-lg ${isOwn
                                                                    ? 'bg-purple-500/20 backdrop-blur-md border border-purple-500/30 hover:border-purple-500/50 hover:shadow-purple-500/20'
                                                                    : 'bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/30 hover:shadow-white/10'
                                                                }`}
                                                        >
                                                            <p className="text-sm break-words text-white">{msg.message}</p>
                                                            <span className="text-xs opacity-70 mt-1 block text-gray-300">
                                                                {formatTime(msg.timestamp)}
                                                            </span>
                                                        </div>
                                                        {/* Message Reactions */}
                                                        <div className="absolute -bottom-2 left-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleReaction(msg.id, '❤️')}
                                                                className="bg-white/10 backdrop-blur-md rounded-full p-1 hover:bg-white/20 transition-colors"
                                                            >
                                                                <Heart className="w-3 h-3 text-red-400" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReaction(msg.id, '👍')}
                                                                className="bg-white/10 backdrop-blur-md rounded-full p-1 hover:bg-white/20 transition-colors"
                                                            >
                                                                <ThumbsUp className="w-3 h-3 text-blue-400" />
                                                            </button>
                                                        </div>
                                                        {messageReactions[msg.id] && messageReactions[msg.id].length > 0 && (
                                                            <div className="flex gap-1 mt-1">
                                                                {Array.from(new Set(messageReactions[msg.id])).map((reaction, idx) => (
                                                                    <span key={idx} className="text-xs bg-white/10 backdrop-blur-md rounded-full px-2 py-0.5">
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
                                    {isTyping && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-center gap-2 text-gray-400 text-sm"
                                        >
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                            Someone is typing...
                                        </motion.div>
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="dm" className="flex-1 flex flex-col mt-0">
                            {!selectedRecipient ? (
                                <div className="flex-1 p-4">
                                    <p className="text-gray-400 text-sm mb-4">Select a participant to start a private conversation:</p>
                                    <div className="space-y-2">
                                        {participants.filter(p => p.userId !== currentUserId).map((participant) => (
                                            <button
                                                key={participant.userId}
                                                onClick={() => setSelectedRecipient(participant.userId)}
                                                className="w-full p-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-lg transition-all text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {participant.userName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{participant.userName}</p>
                                                        <p className="text-xs text-gray-400">
                                                            {participant.isHost ? 'Host' : 'Participant'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                {participants.find(p => p.userId === selectedRecipient)?.userName.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-white font-medium">
                                                {participants.find(p => p.userId === selectedRecipient)?.userName}
                                            </span>
                                        </div>
                                        <Button
                                            onClick={() => setSelectedRecipient(null)}
                                            size="sm"
                                            variant="ghost"
                                            className="text-gray-400 hover:text-white hover:bg-white/10"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                                        <div className="space-y-4">
                                            {filteredMessages.length === 0 ? (
                                                <div className="text-center text-gray-400 mt-8">
                                                    <p>No messages yet</p>
                                                    <p className="text-sm mt-1">Start a private conversation!</p>
                                                </div>
                                            ) : (
                                                filteredMessages.map((msg) => {
                                                    const isOwn = msg.userId === currentUserId;
                                                    return (
                                                        <motion.div
                                                            key={msg.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                                                        >
                                                            <div
                                                                className={`max-w-[80%] rounded-lg px-3 py-2 transition-all hover:shadow-lg ${isOwn
                                                                        ? 'bg-purple-500/20 backdrop-blur-md border border-purple-500/30 hover:border-purple-500/50 hover:shadow-purple-500/20'
                                                                        : 'bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/30 hover:shadow-white/10'
                                                                    }`}
                                                            >
                                                                <p className="text-sm break-words text-white">{msg.message}</p>
                                                                <span className="text-xs opacity-70 mt-1 block text-gray-300">
                                                                    {formatTime(msg.timestamp)}
                                                                </span>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </ScrollArea>
                                </>
                            )}
                        </TabsContent>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10">
                            <div className="relative">
                                {showEmojiPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute bottom-full mb-2 left-0 bg-black/40 backdrop-blur-xl border border-white/20 rounded-lg p-3 shadow-2xl"
                                    >
                                        <div className="grid grid-cols-4 gap-2">
                                            {commonEmojis.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => handleEmojiClick(emoji)}
                                                    className="text-2xl hover:scale-125 transition-transform p-1"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        size="icon"
                                        variant="ghost"
                                        className="text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <Smile className="w-5 h-5" />
                                    </Button>
                                    <Input
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder={activeTab === 'dm' && !selectedRecipient ? 'Select a recipient first...' : 'Type a message...'}
                                        disabled={activeTab === 'dm' && !selectedRecipient}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:bg-white/10 backdrop-blur-md transition-all"
                                    />
                                    <Button
                                        onClick={handleSend}
                                        size="icon"
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all hover:shadow-lg hover:shadow-purple-500/50"
                                        disabled={!inputMessage.trim() || (activeTab === 'dm' && !selectedRecipient)}
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
