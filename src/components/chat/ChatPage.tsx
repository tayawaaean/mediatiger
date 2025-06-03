import React, { useState, useRef } from 'react';
import { ChatContainer } from './ChatContainer';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'other';
    timestamp: Date;
    isPinned?: boolean;
    reactions?: string[];
    replyTo?: {
        id: string;
        content: string;
    };
    file?: {
        name: string;
        type: string;
        url: string;
    };
}

interface ChatPageProps {
    isAdmin?: boolean;
    onMessageSent?: (message: Message) => void;
    onMessageReceived?: (message: Message) => void;
    previewImage?: string | null;
    setPreviewImage?: (image: string | null) => void;
    isLoading?: boolean;
    messages?: Message[];
    renderMessage?: (message: Message) => React.ReactNode;
    messagesEndRef?: React.RefObject<HTMLDivElement>;
    newMessage?: string;
    setNewMessage?: (message: string) => void;
    handleSendMessage?: (content: string, file?: File) => void;
    selectedFile?: File | null;
    handleFileSelect?: (file: File) => void;
    setSelectedFile?: (file: File | null) => void;
    onTogglePin?: (messageId: string) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
                                                      isAdmin = false,
                                                      onMessageSent,
                                                      onMessageReceived,
                                                      previewImage,
                                                      setPreviewImage,
                                                      isLoading = false,
                                                      messages: externalMessages,
                                                      renderMessage,
                                                      messagesEndRef: externalMessagesEndRef,
                                                      newMessage: externalNewMessage,
                                                      setNewMessage: externalSetNewMessage,
                                                      handleSendMessage: externalHandleSendMessage,
                                                      selectedFile,
                                                      handleFileSelect,
                                                      setSelectedFile,
                                                      onTogglePin,
                                                  }) => {
    // Internal state - used as fallback if external props not provided
    const [internalMessages, setInternalMessages] = useState<Message[]>([
        {
            id: '1',
            content: "Hi there! I'm here to help you with any questions you might have.",
            sender: 'other',
            timestamp: new Date(Date.now() - 3600000)
        },
        {
            id: '2',
            content: "I have a question about my recent order #12345",
            sender: 'user',
            timestamp: new Date(Date.now() - 3000000),
        },
        {
            id: '3',
            content: "Of course! I can help you track your order status.",
            sender: 'other',
            timestamp: new Date(Date.now() - 2400000),
        },
    ]);

    const [internalNewMessage, setInternalNewMessage] = useState('');
    const internalMessagesEndRef = useRef<HTMLDivElement>(null);

    // Use external props if provided, otherwise use internal state
    const messages = externalMessages || internalMessages;
    const newMessage = externalNewMessage !== undefined ? externalNewMessage : internalNewMessage;
    const setNewMessage = externalSetNewMessage || setInternalNewMessage;
    const messagesEndRef = externalMessagesEndRef || internalMessagesEndRef;

    const [replyingTo, setReplyingTo] = useState<{ id: string; content: string; } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Default message renderer
    const defaultRenderMessage = (message: Message) => {
        return (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                }`}>
                    {message.replyTo && (
                        <div className="text-xs opacity-70 mb-1 p-2 rounded bg-black/10">
                            Replying to: {message.replyTo.content.substring(0, 50)}...
                        </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    {message.file && (
                        <div className="mt-2">
                            {message.file.type.startsWith('image/') ? (
                                <img
                                    src={message.file.url}
                                    alt={message.file.name}
                                    className="max-w-full h-auto rounded cursor-pointer"
                                    onClick={() => setPreviewImage?.(message.file!.url)}
                                />
                            ) : (
                                <a
                                    href={message.file.url}
                                    download={message.file.name}
                                    className="text-blue-300 underline text-sm"
                                >
                                    📎 {message.file.name}
                                </a>
                            )}
                        </div>
                    )}
                    <p className="text-xs mt-1 opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                    {message.reactions && message.reactions.length > 0 && (
                        <div className="flex gap-1 mt-1">
                            {message.reactions.map((reaction, index) => (
                                <span key={index} className="text-xs bg-black/20 px-1 rounded">
                                    {reaction}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const handleSendMessageInternal = (content: string, file?: File) => {
        if (externalHandleSendMessage) {
            externalHandleSendMessage(content, file);
        } else {
            // Default internal behavior
            const newMsg: Message = {
                id: Date.now().toString(),
                content,
                sender: isAdmin ? 'other' : 'user',
                timestamp: new Date(),
                replyTo: replyingTo,
                file: file ? {
                    name: file.name,
                    type: file.type,
                    url: URL.createObjectURL(file)
                } : undefined,
            };
            setInternalMessages(prev => [...prev, newMsg]);
            onMessageSent?.(newMsg);
        }

        // Reset reply state
        setReplyingTo(null);
        setSelectedFile?.(null);
    };

    // Handle receiving messages from the other side
    React.useEffect(() => {
        if (onMessageReceived) {
            const handleNewMessage = (message: Message) => {
                if (!externalMessages) {
                    setInternalMessages(prev => [...prev, message]);
                }
            };

            return () => {
                // Clean up if needed
            };
        }
    }, [onMessageReceived, externalMessages]);

    // Auto-scroll to bottom when new messages arrive
    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleReply = (messageId: string) => {
        const message = messages.find(m => m.id === messageId);
        if (message) {
            setReplyingTo({
                id: message.id,
                content: message.content,
            });
        }
    };

    const handleAddReaction = (messageId: string, emoji: string) => {
        if (externalMessages) {
            // If using external messages, this should be handled externally
            return;
        }

        setInternalMessages(prevMessages => prevMessages.map(message =>
            message.id === messageId
                ? {
                    ...message,
                    reactions: message.reactions?.includes(emoji)
                        ? message.reactions.filter(r => r !== emoji)
                        : [...(message.reactions || []), emoji]
                }
                : message
        ));
    };

    const handleTogglePin = (messageId: string) => {
        // If external pin handler is provided, use it
        if (onTogglePin) {
            onTogglePin(messageId);
            return;
        }

        // Only update internal messages if we're managing them internally
        if (!externalMessages) {
            setInternalMessages(prevMessages => prevMessages.map(message =>
                message.id === messageId
                    ? { ...message, isPinned: !message.isPinned }
                    : message
            ));
        }
    };

    const pinnedMessages = messages.filter(m => m.isPinned);
    const regularMessages = messages.filter(message =>
        searchQuery === '' ||
        message.content.toLowerCase().split(' ').some(word =>
            word.startsWith(searchQuery.toLowerCase())
        ) ||
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        new Date(message.timestamp).toLocaleString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto py-4 px-4 relative">
            <ChatContainer>
                <ChatHeader
                    recipientName={isAdmin ? "Chat" : "Live Support"}
                    onSearch={setSearchQuery}
                />

                {/* Loading indicator */}
                {isLoading && (
                    <div className="px-6 py-3 bg-slate-700/30 border-b border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-300">
                            <div className="animate-spin w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full"></div>
                            <span className="text-sm">Loading...</span>
                        </div>
                    </div>
                )}

                {/* Pinned messages */}
                {pinnedMessages.length > 0 && (
                    <div className="px-6 py-3 bg-slate-700/30 border-b border-slate-700/50">
                        <h3 className="text-sm font-medium text-slate-300 mb-2">📌 Pinned Messages</h3>
                        <div className="space-y-2">
                            {pinnedMessages.map(message => (
                                <div key={message.id} className="p-2 rounded bg-slate-800/50 text-sm text-slate-300">
                                    {message.content}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <MessageList
                    messages={regularMessages}
                    searchQuery={searchQuery}
                    isAdmin={isAdmin}
                    onReply={handleReply}
                    onTogglePin={handleTogglePin}
                    onAddReaction={handleAddReaction}
                />

                <MessageInput
                    onSendMessage={handleSendMessageInternal}
                    replyingTo={replyingTo}
                    isAdmin={isAdmin}
                    onCancelReply={() => setReplyingTo(null)}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    selectedFile={selectedFile}
                    onFileSelect={handleFileSelect}
                    onClearFile={() => setSelectedFile?.(null)}
                />
            </ChatContainer>

            {/* Image preview modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                    onClick={() => setPreviewImage?.(null)}
                >
                    <div className="max-w-4xl max-h-4xl p-4">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain"
                        />
                        <button
                            className="absolute top-4 right-4 text-white text-2xl"
                            onClick={() => setPreviewImage?.(null)}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};