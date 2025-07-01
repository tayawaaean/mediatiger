import React, { useState, useRef, Dispatch, SetStateAction } from "react";
import { ChatContainer } from "./ChatContainer";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useAuth } from "../../contexts/AuthContext";
import { adminId } from "../../features/admin/pages/AdminPanel";
import { User } from "../messages/AdminMessagesView";

export interface MessageInput {
  content: string;
  replyTo: string;
  isPinned?: boolean;
}

export interface Message {
  id: string;
  content: string;
  // timestamp: Date;
  isPinned?: boolean;
  sender: "user" | "other";
  // reactions?: string[];
  reactions?: { userId: string; emoji: string }[];
  replyTo?: string | null;
  sender_id: string;
  receiver_id: string;
  image_url: string | null;
  created_at: string;
  read_at: string | null;
  shouldGroup: boolean;
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
  newMessage?: MessageInput;
  setNewMessage?: Dispatch<SetStateAction<MessageInput>>;
  handleSendMessage?: (content: string, file?: File) => void;
  selectedFile?: File | null;
  handleFileSelect?: (file: File) => void;
  setSelectedFile?: (file: File | null) => void;
  onTogglePin?: (messageId: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  selectedUser?: User;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  isAdmin = false,
  onMessageSent,
  previewImage,
  setPreviewImage,
  isLoading = false,
  messages: externalMessages,
  messagesEndRef: externalMessagesEndRef,
  newMessage: externalNewMessage,
  setNewMessage: externalSetNewMessage,
  handleSendMessage: externalHandleSendMessage,
  selectedFile,
  handleFileSelect,
  setSelectedFile,
  onTogglePin,
  onAddReaction,
  selectedUser,
}) => {
  const { user } = useAuth();

  const [internalNewMessage, setInternalNewMessage] = useState<MessageInput>({
    content: "",
    replyTo: "",
  });
  const internalMessagesEndRef = useRef<HTMLDivElement>(null);

  // Use external props if provided, otherwise use internal state
  const messages = externalMessages;
  const newMessage =
    externalNewMessage !== undefined ? externalNewMessage : internalNewMessage;
  const setNewMessage = externalSetNewMessage || setInternalNewMessage;
  const messagesEndRef = externalMessagesEndRef || internalMessagesEndRef;

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSendMessageInternal = (content: string, file?: File) => {
    if (!user) {
      console.error("No user found");
      return;
    }

    if (externalHandleSendMessage) {
      externalHandleSendMessage(content, file);
    } else {
      // Default internal behavior
      const newMsg: Message = {
        id: Date.now().toString(),
        content,
        sender: isAdmin ? "other" : "user",
        replyTo: newMessage.replyTo,
        isPinned: false,
        sender_id: user.id,
        receiver_id: isAdmin ? adminId : user.id,
        created_at: new Date().toISOString(),
        read_at: null,
        shouldGroup: false,
        image_url: file ? URL.createObjectURL(file) : null,
      };
      onMessageSent?.(newMsg);
    }

    // Reset message state
    setNewMessage({
      content: "",
      replyTo: "",
    });
    setSelectedFile?.(null);
  };

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleReply = (messageId: string) => {
    const message = messages?.find((m) => m.id === messageId);
    if (message) {
      setReplyingTo(message.content);
      setNewMessage((prev) => ({
        ...prev,
        replyTo: message.content,
      }));
    }
  };

  // Use external or internal add reaction handler

  const handleTogglePin = (messageId: string) => {
    // If external pin handler is provided, use it
    if (onTogglePin) {
      onTogglePin(messageId);
      return;
    }
  };

  const pinnedMessages = messages?.filter((m) => m.isPinned);
  const regularMessages = messages?.filter(
    (message) =>
      searchQuery === "" ||
      message.content
        .toLowerCase()
        .split(" ")
        .some((word) => word.startsWith(searchQuery.toLowerCase())) ||
      message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 relative">
      <ChatContainer isAdmin>
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
        {pinnedMessages && pinnedMessages.length > 0 && (
          <div className="px-6 py-3 bg-slate-700/30 border-b border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-2">
              📌 Pinned Messages
            </h3>
            <div className="space-y-2">
              {pinnedMessages.map((message) => (
                <div
                  key={message.id}
                  className="p-2 rounded bg-slate-800/50 text-sm text-slate-300 flex items-center justify-between group"
                >
                  <div className="flex-1">{message.content}</div>
                  <button
                    onClick={() => onTogglePin?.(message.id)}
                    className="p-1.5 rounded-full bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Unpin message"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <MessageList
          messages={regularMessages || []}
          searchQuery={searchQuery}
          isAdmin={isAdmin}
          onReply={handleReply}
          onTogglePin={handleTogglePin}
          onAddReaction={onAddReaction}
          setNewMessage={setNewMessage}
          selectedUser={selectedUser}
        />
        <MessageInput
          onSendMessage={handleSendMessageInternal}
          replyingTo={replyingTo}
          isAdmin={isAdmin}
          onCancelReply={() => {
            setReplyingTo(null);
            setNewMessage({
              content: "",
              replyTo: "",
            });
          }}
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
          <div className="max-w-5xl max-h-5xl p-4">
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
