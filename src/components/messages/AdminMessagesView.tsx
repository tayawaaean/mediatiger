import React from "react";
import { MessageSquare, Search, Send, Paperclip, X } from "lucide-react";
import { ImagePreview } from "../ImagePreview";
import { ChatPage, Message } from "../chat/ChatPage";

export interface User {
  id: string;
  email: string;
  full_name: string;
  user_metadata: {
    avatar_url: string;
    email: string;
    email_verification_notification: boolean;
    email_verified: boolean;
    full_name: string;
    onboarding_complete: boolean;
    phone_verified: boolean;
    role: string;
    show_tutorial: boolean;
    sub: string;
    username: string;
  };
  last_message: string;
  last_message_time: string;
  unread_count?: number;
  online?: boolean;
}

interface AdminMessagesViewProps {
  filteredUsers: User[];
  selectedUser: User | null;
  setSelectedUser: (user: User) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  messages: Message[];
  isLoading: boolean;
  handleSendMessage: () => void;
  newMessage: MessageInput;
  setNewMessage: (message: MessageInput) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewImage: string | null;
  setPreviewImage: (url: string | null) => void;
  renderMessage: (message: Message) => React.ReactNode;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onAddReaction?: (messageId: string, emoji: string) => void;
}

export const AdminMessagesView: React.FC<AdminMessagesViewProps> = ({
  filteredUsers,
  selectedUser,
  setSelectedUser,
  searchTerm,
  setSearchTerm,
  messages,
  isLoading,
  handleSendMessage,
  newMessage,
  setNewMessage,
  selectedFile,
  setSelectedFile,
  handleFileSelect,
  previewImage,
  setPreviewImage,
  renderMessage,
  messagesEndRef,
  onAddReaction,
  onTogglePin,
}) => {
  const handleFileSelectForChat = (file: File) => {
    // Create a synthetic event that matches the expected type
    const syntheticEvent = {
      target: {
        files: [file],
      },
      currentTarget: document.createElement("input"),
      nativeEvent: new Event("change"),
      bubbles: true,
      cancelable: true,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: true,
      preventDefault: () => {},
      stopPropagation: () => {},
      isDefaultPrevented: () => false,
      isPropagationStopped: () => false,
      persist: () => {},
      timeStamp: Date.now(),
      type: "change",
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileSelect(syntheticEvent);
  };

  console.log("selectedUser", selectedUser);

  return (
    <div className="h-full flex flex-col min-h-0">
      <ImagePreview
        previewImage={previewImage}
        setPreviewImage={setPreviewImage}
      />
      <div className="flex flex-1 min-h-0">
        <UsersList
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredUsers={filteredUsers}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
        <div className="flex-1 min-h-0 flex flex-col">
          <ChatPage
            previewImage={previewImage}
            setPreviewImage={setPreviewImage}
            isLoading={isLoading}
            messages={messages}
            renderMessage={renderMessage}
            messagesEndRef={messagesEndRef}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            selectedFile={selectedFile}
            handleFileSelect={handleFileSelectForChat}
            setSelectedFile={setSelectedFile}
            isAdmin={true}
            onTogglePin={onTogglePin}
            onAddReaction={onAddReaction}
            selectedUser={selectedUser}
          />
        </div>
      </div>
    </div>
  );
};

interface UsersListProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredUsers: User[];
  selectedUser: User | null;
  setSelectedUser: (user: User) => void;
}

const UsersList: React.FC<UsersListProps> = ({
  searchTerm,
  setSearchTerm,
  filteredUsers,
  selectedUser,
  setSelectedUser,
}) => {
  return (
    <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl shadow-xl border border-slate-700/50 overflow-hidden w-16 sm:w-96 md:w-[28rem] min-w-16 flex flex-col">
      <div className="p-4 border-b border-slate-700/50 hidden sm:block">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#232b3a] border border-slate-500/30 text-white placeholder-slate-400 rounded-lg pl-10 pr-3 py-2 text-base focus:outline-none focus:border-indigo-400 focus:ring-0 transition-all shadow-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 p-2 sm:p-4 max-h-[600px] overflow-y-auto">
        {filteredUsers.map((u) => (
          <div
            key={u.id}
            className={`
              flex items-center justify-center sm:justify-start p-2 sm:p-3 rounded-lg cursor-pointer transition-all
              ${
                selectedUser?.id === u.id
                  ? "sm:bg-slate-700/50"
                  : "hover:bg-slate-700/30"
              }
            `}
            onClick={() => setSelectedUser(u)}
          >
            <div className="relative flex-shrink-0">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium overflow-hidden transition-all ${
                  selectedUser?.id === u.id
                    ? "ring-4 ring-white ring-offset-2 ring-offset-slate-800 sm:ring-0 sm:ring-offset-0"
                    : ""
                }`}
              >
                {u.user_metadata.avatar_url ? (
                  <img
                    src={u.user_metadata.avatar_url}
                    alt={u.full_name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  u.full_name.charAt(0).toUpperCase()
                )}
              </div>
              {u.online && (
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-800"></div>
              )}
            </div>
            <div className="hidden sm:flex flex-1 min-w-0 flex-col ml-3">
              <h3 className="font-medium text-slate-200 truncate">
                {u.full_name}
              </h3>
              <p className="text-sm text-slate-400 truncate">
                {u.user_metadata.username}
              </p>
            </div>
            {u.unread_count && u.unread_count > 0 && (
              <span className="hidden sm:inline ml-2 px-2 py-0.5 text-xs font-medium bg-indigo-600 text-white rounded-full">
                {u.unread_count}
              </span>
            )}
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center py-6 text-slate-400 text-sm hidden sm:block">
            No users found
          </div>
        )}
      </div>
    </div>
  );
};

interface ChatAreaProps {
  selectedUser: User | null;
  isLoading: boolean;
  messages: Message[];
  renderMessage: (message: Message) => React.ReactNode;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  newMessage: MessageInput;
  setNewMessage: (message: MessageInput) => void;
  handleSendMessage: () => void;
  selectedFile: File | null;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedFile: (file: File | null) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedUser,
  isLoading,
  messages,
  renderMessage,
  messagesEndRef,
  newMessage,
  setNewMessage,
  handleSendMessage,
  selectedFile,
  handleFileSelect,
  setSelectedFile,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-900/95 min-h-0">
      {selectedUser ? (
        <>
          <ChatHeader user={selectedUser} />
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto">
              <MessageList
                isLoading={isLoading}
                messages={messages}
                renderMessage={renderMessage}
                messagesEndRef={messagesEndRef}
              />
            </div>
            <div className="shrink-0">
              <MessageInput
                onSendMessage={handleSendMessage}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
                onClearFile={() => setSelectedFile(null)}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400 flex-col p-8">
          <div className="bg-slate-800/40 rounded-full p-5 mb-4">
            <MessageSquare className="h-10 w-10 text-indigo-400" />
          </div>
          <p className="text-center text-lg font-medium text-slate-300">
            Select a user to start chatting
          </p>
          <p className="text-center text-sm text-slate-500 mt-2">
            Choose a conversation from the sidebar
          </p>
        </div>
      )}
    </div>
  );
};

const ChatHeader: React.FC<{ user: User }> = ({ user }) => (
  <div className="py-2 px-4 border-b border-slate-800/80 bg-slate-800/40 flex items-center justify-between sticky top-0 z-10">
    <div className="flex items-center">
      <div className="h-10 w-10 rounded-full bg-indigo-600/20 flex items-center justify-center mr-3 overflow-hidden">
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.full_name || user.email}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <MessageSquare className="h-5 w-5 text-indigo-400" />
        )}
      </div>
      <div>
        <h1 className="text-lg font-semibold text-white">
          {user?.full_name || user?.email || "Unknown User"}
        </h1>
        <p className="text-sm text-slate-400">
          {user?.online ? "Online" : "Offline"}
        </p>
      </div>
    </div>
  </div>
);

interface MessageInputProps {
  onSendMessage: () => void;
  newMessage: MessageInput;
  setNewMessage: (message: MessageInput) => void;
  selectedFile: File | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  newMessage,
  setNewMessage,
  selectedFile,
  onFileSelect,
  onClearFile,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && newMessage.content.trim()) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="p-2 md:p-3 bg-slate-800/40 border-t border-slate-800/80">
      {selectedFile && (
        <div className="mb-2 bg-slate-800/60 p-2 rounded-md flex items-center">
          <div className="flex-1 text-sm text-slate-300 truncate">
            📎 {selectedFile.name}
          </div>
          <button
            onClick={onClearFile}
            className="ml-2 text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => document.getElementById("file-upload")?.click()}
          className="h-9 w-9 flex-shrink-0 flex items-center justify-center text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={onFileSelect}
        />
        <div className="flex-1 flex items-center">
          <textarea
            value={newMessage.content}
            onChange={(e) =>
              setNewMessage({ ...newMessage, content: e.target.value })
            }
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full bg-slate-700/80 text-white rounded-md py-2 px-3 resize-none min-h-[36px] max-h-20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all overflow-hidden"
            style={{
              height: newMessage.content.trim()
                ? newMessage.content.split("\n").length > 1
                  ? "auto"
                  : "36px"
                : "36px",
              overflowY: newMessage.content.trim() ? "auto" : "hidden",
            }}
            rows={1}
          />
        </div>
        <button
          onClick={onSendMessage}
          disabled={!newMessage.content.trim() && !selectedFile}
          className="h-9 w-9 flex-shrink-0 flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed rounded-md transition-all"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

interface MessageListProps {
  isLoading: boolean;
  messages: Message[];
  renderMessage: (message: Message) => React.ReactNode;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({
  isLoading,
  messages,
  renderMessage,
  messagesEndRef,
}) => (
  <div className="flex-1 overflow-y-auto p-4 messages-container scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent absolute inset-0">
    {isLoading ? (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    ) : (
      <div className="space-y-2">
        {messages && messages.length > 0 ? (
          messages.map((message) => renderMessage(message))
        ) : (
          <div className="text-center py-8 text-slate-400 bg-slate-800/20 rounded-lg p-6">
            No messages yet with this user. Send a message to start the
            conversation.
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>
    )}
  </div>
);
