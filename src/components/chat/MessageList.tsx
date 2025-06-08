import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { Reply, Pin, Smile, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Message, MessageInput } from "./ChatPage";

// Custom date utility functions
const formatDistanceToNow = (date: Date | string) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (!dateObj || isNaN(dateObj.getTime())) {
    return "unknown time";
  }

  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60)
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  if (diffInDays < 7)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  return dateObj.toLocaleDateString();
};

const format = (date: Date | string, formatString: string) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (!dateObj || isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (formatString === "MMMM d, yyyy") {
    return `${
      months[dateObj.getMonth()]
    } ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
  }
  return dateObj.toLocaleDateString();
};

const isToday = (date: Date | string) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (!dateObj || isNaN(dateObj.getTime())) return false;
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

const isYesterday = (date: Date | string) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (!dateObj || isNaN(dateObj.getTime())) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateObj.toDateString() === yesterday.toDateString();
};

const isSameDay = (date1: Date | string, date2: Date | string) => {
  const dateObj1 = typeof date1 === "string" ? new Date(date1) : date1;
  const dateObj2 = typeof date2 === "string" ? new Date(date2) : date2;

  if (
    !dateObj1 ||
    !dateObj2 ||
    isNaN(dateObj1.getTime()) ||
    isNaN(dateObj2.getTime())
  )
    return false;
  return dateObj1.toDateString() === dateObj2.toDateString();
};

// Avatar component
const Avatar = ({
  letter,
  size = "sm",
  className = "",
}: {
  letter: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium ${className}`}
    >
      {letter}
    </div>
  );
};

const highlightText = (text: string, searchQuery: string) => {
  if (!searchQuery) return text;

  const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === searchQuery.toLowerCase() ? (
      <span key={i} className="bg-yellow-500/30 text-white px-1 rounded">
        {part}
      </span>
    ) : (
      part
    )
  );
};

const formatMessageDate = (date: Date | string) => {
  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "MMMM d, yyyy");
};

const EMOJI_REACTIONS = ["👍", "❤️", "😮", "😢", "😡", "🎉"];

interface MessageListProps {
  messages: Message[];
  searchQuery: string;
  isAdmin: boolean;
  onReply: (messageId: string) => void;
  onTogglePin: (messageId: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  setNewMessage: Dispatch<SetStateAction<MessageInput>>;
}

type groupedMsg = Message & { sender: "user" | "other" };
interface MessageGroup {
  date: Date;
  messages: groupedMsg[];
}

const MessageList = ({
  messages,
  searchQuery = "",
  isAdmin = false,
  onReply,
  onTogglePin,
  onAddReaction,
  setNewMessage,
}: MessageListProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messageGroups: MessageGroup[] = messages
    // .map((msg) => {
    //   console.log("msssg", msg);
    //   const isUser = msg.sender_id === user?.id;

    //   return {
    //     ...msg,
    //     sender: isUser ? "user" : "other",
    //   };
    // })
    .reduce((groups, message) => {
      // Safe date handling - use created_at directly from your database
      let messageDate = new Date(message.created_at);
      if (isNaN(messageDate.getTime())) {
        messageDate = new Date(); // Fallback to current date
      }

      const existingGroup = groups.find((group) =>
        isSameDay(group.date, messageDate)
      );

      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({
          date: messageDate,
          messages: [message],
        });
      }

      return groups;
    }, [] as MessageGroup[])
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  console.log("messageGroups", messageGroups);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
      {messageGroups.map((group) => {
        // Safe key generation
        const groupKey =
          group.date && !isNaN(group.date.getTime())
            ? group.date.toISOString()
            : `fallback-${Math.random()}`;

        return (
          <div key={groupKey} className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-slate-700/50"></div>
              <div className="px-4 py-1 rounded-full bg-slate-700/30 border border-slate-600/50 text-xs font-medium text-slate-300">
                {formatMessageDate(group.date)}
              </div>
              <div className="h-px flex-1 bg-slate-700/50"></div>
            </div>

            {group.messages.map((message) => (
              <div
                key={message.id}
                className={`w-full flex ${
                  (isAdmin && message.sender === "other") ||
                  (!isAdmin && message.sender === "user")
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start gap-3 ${
                    (isAdmin && message.sender === "other") ||
                    (!isAdmin && message.sender === "user")
                      ? "flex-row-reverse"
                      : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <Avatar
                    letter={message.sender === "other" ? "S" : "U"}
                    size="sm"
                    className="flex-shrink-0 mt-1"
                  />

                  {/* Message content */}
                  <div className="flex flex-col min-w-0 max-w-[65%]">
                    <div
                      className={`
                        group relative rounded-2xl px-4 py-2.5 
                        break-words hyphens-auto
                        w-fit max-w-full min-w-[80px]
                        ${
                          (isAdmin && message.sender === "other") ||
                          (!isAdmin && message.sender === "user")
                            ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                            : "bg-slate-700/50 text-slate-200"
                        }
                      `}
                    >
                      {message.replyTo && (
                        <div className="mb-2 -mt-1 px-3 py-1.5 rounded bg-black/20">
                          <p className="text-xs font-medium text-indigo-400 mb-0.5">
                            Reply to:
                          </p>
                          <p className="text-sm text-slate-300 line-clamp-2">
                            {message.replyTo}
                          </p>
                        </div>
                      )}

                      {/* Hover actions */}
                      <div
                        className={`
                          absolute top-1/2 -translate-y-1/2
                          ${
                            (isAdmin && message.sender === "other") ||
                            (!isAdmin && message.sender === "user")
                              ? "-left-32"
                              : "-right-32"
                          }
                          flex items-center gap-2
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-200
                        `}
                      >
                        <button
                          onClick={() => {
                            onReply?.(message.id);
                            setNewMessage((prev: MessageInput) => ({
                              ...prev,
                              replyTo: message.content,
                            }));
                          }}
                          className="p-2 rounded-full bg-slate-800/40 hover:bg-slate-700/60 transition-colors duration-200"
                        >
                          <Reply size={16} className="text-slate-300" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowEmojiPicker(
                                showEmojiPicker === message?.id
                                  ? null
                                  : message.id
                              )
                            }
                            className={`
                              p-2 rounded-full
                              ${
                                showEmojiPicker === message.id
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : message.reactions?.length
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-slate-600/20 text-slate-300"
                              }
                              hover:bg-emerald-500/30
                              transition-colors duration-200
                            `}
                          >
                            <Smile size={16} />
                          </button>
                          {showEmojiPicker === message.id && (
                            <div
                              className="
                                absolute top-full mt-2 z-50 
                                bg-slate-800/95 backdrop-blur-sm
                                rounded-lg shadow-lg border border-slate-700/50 
                                p-3
                                min-w-[200px]
                              "
                              style={{
                                left: "50%",
                                transform: "translateX(-50%)",
                              }}
                            >
                              <div className="grid grid-cols-6 gap-1.5">
                                {EMOJI_REACTIONS.map((emoji) => {
                                  // Check if current user has reacted with this emoji
                                  const hasReacted = message.reactions?.some(
                                    (reaction: {
                                      userId: string;
                                      emoji: string;
                                    }) =>
                                      reaction.userId === user?.id &&
                                      reaction.emoji === emoji
                                  );

                                  return (
                                    <button
                                      key={emoji}
                                      onClick={() => {
                                        onAddReaction?.(message.id, emoji);
                                        setShowEmojiPicker(null);
                                      }}
                                      className={`
          aspect-square flex items-center justify-center 
          rounded-md transition-all text-base
          ${
            hasReacted
              ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
              : "hover:bg-slate-700/50"
          }
          hover:scale-105 active:scale-95
          transform duration-100
        `}
                                    >
                                      {emoji}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => onTogglePin?.(message.id)}
                          className={`
                            p-2 rounded-full
                            ${
                              message.isPinned
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-slate-600/20 text-slate-300"
                            }
                            hover:bg-blue-500/30
                            transition-colors duration-200
                          `}
                        >
                          <Pin size={16} />
                        </button>
                      </div>

                      {/* Message text */}
                      <div className="text-base leading-relaxed whitespace-pre-wrap">
                        {highlightText(message.content, searchQuery)}
                        {message.image_url && (
                          <div className="mt-3">
                            <img
                              src={message.image_url}
                              alt="Message attachment"
                              className="max-w-full h-auto rounded-lg shadow-lg"
                              style={{ maxWidth: "300px" }}
                              onError={(
                                e: React.SyntheticEvent<HTMLImageElement, Event>
                              ) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div
                        className={`flex ${
                          (isAdmin && message.sender === "other") ||
                          (!isAdmin && message.sender === "user")
                            ? "justify-end"
                            : "justify-start"
                        } px-2 -mt-3`}
                      >
                        <div className="flex flex-wrap gap-1.5 px-2 py-1">
                          {message.reactions.map((reaction, index) => (
                            <span
                              key={`${reaction.emoji}-${index}`}
                              className="inline-flex items-center text-lg cursor-pointer px-1.5 z-10"
                              onClick={() =>
                                onAddReaction?.(message.id, reaction.emoji)
                              }
                            >
                              {reaction.emoji}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timestamp and metadata */}
                    <div
                      className={`text-sm text-slate-400 px-2 mt-2 flex items-center gap-2 ${
                        (isAdmin && message.sender === "other") ||
                        (!isAdmin && message.sender === "user")
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {/* Show user info for other person's messages or when in admin view */}
                      {((!isAdmin && message.sender === "other") ||
                        (isAdmin && message.sender === "user")) && (
                        <>
                          <span className="font-medium text-slate-300">
                            {message.sender === "other"
                              ? "Support Agent"
                              : "User"}
                          </span>
                          <span className="text-slate-500/50">•</span>
                          <span className="text-xs text-slate-500">
                            {message.sender === "other" ? "@support" : "@user"}
                          </span>
                          <span className="text-slate-500/50">•</span>
                        </>
                      )}

                      {/* Timestamp - now using created_at directly */}
                      <span>{formatDistanceToNow(message.created_at)}</span>

                      {/* Support agent badge */}
                      {message.sender === "other" && (
                        <>
                          <span className="text-slate-500/50">•</span>
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <Shield size={14} className="text-emerald-400" />
                            <span>Support Agent</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export { MessageList };
export default MessageList;
