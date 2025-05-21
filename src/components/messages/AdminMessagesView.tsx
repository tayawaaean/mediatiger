import React from 'react';
import { MessageSquare, Search, Send, Paperclip, X } from 'lucide-react';
import { ImagePreview } from '../ImagePreview';

interface AdminMessagesViewProps {
  previewImage: string | null;
  setPreviewImage: (url: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredUsers: any[];
  selectedUser: any;
  setSelectedUser: (user: any) => void;
  isLoading: boolean;
  messages: any[];
  renderMessage: (message: any) => React.ReactNode;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  selectedFile: File | null;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedFile: (file: File | null) => void;
}

export const AdminMessagesView: React.FC<AdminMessagesViewProps> = ({
  previewImage,
  setPreviewImage,
  searchTerm,
  setSearchTerm,
  filteredUsers,
  selectedUser,
  setSelectedUser,
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
    <div className="h-full flex flex-col overflow-hidden">
      <ImagePreview
        previewImage={previewImage}
        setPreviewImage={setPreviewImage}
      />
      <div className="flex-1 h-full overflow-hidden">
        <div className="h-full bg-slate-900 rounded-md shadow-md border border-slate-700/50 flex overflow-hidden">
          <UsersList
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredUsers={filteredUsers}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
          <ChatArea
            selectedUser={selectedUser}
            isLoading={isLoading}
            messages={messages}
            renderMessage={renderMessage}
            messagesEndRef={messagesEndRef}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            selectedFile={selectedFile}
            handleFileSelect={handleFileSelect}
            setSelectedFile={setSelectedFile}
          />
        </div>
      </div>
    </div>
  );
};

interface UsersListProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredUsers: any[];
  selectedUser: any;
  setSelectedUser: (user: any) => void;
}

const UsersList: React.FC<UsersListProps> = ({
  searchTerm,
  setSearchTerm,
  filteredUsers,
  selectedUser,
  setSelectedUser,
}) => {
  return (
    <div className="w-72 md:w-80 border-r border-slate-800/80 flex flex-col">
      <div className="p-3 border-b border-slate-800/80 bg-slate-800/40">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-700/80 text-white rounded-md pl-8 pr-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        <div className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          User Conversations
        </div>
        {filteredUsers.map((u) => (
          <UserListItem
            key={u.id}
            user={u}
            isSelected={selectedUser?.id === u.id}
            onSelect={() => setSelectedUser(u)}
          />
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center py-6 text-slate-400 text-sm">
            No users found
          </div>
        )}
      </div>
    </div>
  );
};

interface UserListItemProps {
  user: any;
  isSelected: boolean;
  onSelect: () => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, isSelected, onSelect }) => (
  <button
    onClick={onSelect}
    className={`w-full p-3 text-left hover:bg-slate-800/70 transition-colors ${
      isSelected ? "bg-indigo-500/10 border-l-2 border-indigo-500" : ""
    }`}
  >
    <div className="flex items-center">
      <div className="h-10 w-10 rounded-full bg-indigo-600/20 flex items-center justify-center mr-3 overflow-hidden">
        {user.avatar_url ? (
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
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-white truncate">
          {user.full_name || user.email}
        </h3>
        {user.last_message && (
          <p className="text-xs text-slate-400 truncate mt-1">
            {user.last_message}
          </p>
        )}
      </div>
      {user.unread_count > 0 && (
        <span className="ml-2 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {user.unread_count}
        </span>
      )}
    </div>
  </button>
);

interface ChatAreaProps {
  selectedUser: any;
  isLoading: boolean;
  messages: any[];
  renderMessage: (message: any) => React.ReactNode;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  selectedFile: File | null;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedFile: (file: File | null) => void;
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
    <div className="flex-1 flex flex-col bg-slate-900/95">
      {selectedUser ? (
        <>
          <ChatHeader user={selectedUser} />
          <div className="flex-1 relative">
            <MessageList
              isLoading={isLoading}
              messages={messages}
              renderMessage={renderMessage}
              messagesEndRef={messagesEndRef}
            />
          </div>
          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            selectedFile={selectedFile}
            handleFileSelect={handleFileSelect}
            setSelectedFile={setSelectedFile}
          />
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400 flex-col p-8">
          <div className="bg-slate-800/40 rounded-full p-5 mb-4">
            <MessageSquare className="h-10 w-10 text-indigo-400" />
          </div>
          <p className="text-center text-lg font-medium text-slate-300">Select a user to start chatting</p>
          <p className="text-center text-sm text-slate-500 mt-2">Choose a conversation from the sidebar</p>
        </div>
      )}
    </div>
  );
};

const ChatHeader: React.FC<{ user: any }> = ({ user }) => (
  <div className="py-2 px-4 border-b border-slate-800/80 bg-slate-800/40 flex items-center justify-between sticky top-0 z-10">
    <div className="flex items-center">
      <div className="h-10 w-10 rounded-full bg-indigo-600/20 flex items-center justify-center mr-3 overflow-hidden">
        {user.avatar_url ? (
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
          {user.full_name || user.email}
        </h1>
        <p className="text-sm text-slate-400">{user.online ? 'Online' : 'Offline'}</p>
      </div>
    </div>
  </div>
);

interface MessageListProps {
  isLoading: boolean;
  messages: any[];
  renderMessage: (message: any) => React.ReactNode;
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
            No messages yet with this user. Send a message to start the conversation.
          </div>
        )}
        
        <div ref={messagesEndRef}></div>
      </div>
    )}
  </div>
);

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  selectedFile: File | null;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedFile: (file: File | null) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
  selectedFile,
  handleFileSelect,
  setSelectedFile,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && newMessage.trim()) {
      e.preventDefault();
      handleSendMessage();
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
            onClick={() => setSelectedFile(null)}
            className="ml-2 text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => document.getElementById('file-upload')?.click()}
          className="h-9 w-9 flex-shrink-0 flex items-center justify-center text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />
        <div className="flex-1 flex items-center">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full bg-slate-700/80 text-white rounded-md py-2 px-3 resize-none min-h-[36px] max-h-20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all overflow-hidden"
            style={{ 
              height: newMessage.trim() ? (newMessage.split('\n').length > 1 ? 'auto' : '36px') : '36px',
              overflowY: newMessage.trim() ? 'auto' : 'hidden'
            }}
            rows={1}
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() && !selectedFile}
          className="h-9 w-9 flex-shrink-0 flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed rounded-md transition-all"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};