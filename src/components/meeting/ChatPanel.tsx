import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/types/meeting';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, X } from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    currentUserId: string;
}

export const ChatPanel: FC<ChatPanelProps> = ({
    isOpen,
    onClose,
    messages,
    onSendMessage,
    currentUserId,
}) => {
    const [inputMessage, setInputMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (inputMessage.trim()) {
            onSendMessage(inputMessage.trim());
            setInputMessage('');
        }
    };

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
                    className="fixed right-0 top-0 bottom-0 w-96 bg-gray-900/95 backdrop-blur-lg border-l border-gray-700 shadow-2xl z-40 flex flex-col"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                        <h3 className="text-white font-semibold text-lg">Meeting Chat</h3>
                        <Button
                            onClick={onClose}
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white hover:bg-white/10"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                        <div className="space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-500 mt-8">
                                    <p>No messages yet</p>
                                    <p className="text-sm mt-1">Be the first to say hello!</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
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
                                            <div
                                                className={`max-w-[80%] rounded-lg px-3 py-2 ${isOwn
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-gray-700 text-gray-100'
                                                    }`}
                                            >
                                                <p className="text-sm break-words">{msg.message}</p>
                                                <span className="text-xs opacity-70 mt-1 block">
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-700">
                        <div className="flex items-center gap-2">
                            <Input
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                            />
                            <Button
                                onClick={handleSend}
                                size="icon"
                                className="bg-purple-600 hover:bg-purple-700"
                                disabled={!inputMessage.trim()}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
