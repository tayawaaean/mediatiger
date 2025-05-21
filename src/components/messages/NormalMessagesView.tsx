import React from 'react';
import { MessageSquare, Send, Paperclip, X } from 'lucide-react';
import { ImagePreview } from '../ImagePreview';

interface NormalMessagesViewProps {
  previewImage: string | null;
  setPreviewImage: (url: string | null) => void;
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

export const NormalMessagesView: React.FC<NormalMessagesViewProps> = ({
  previewImage,
  setPreviewImage,
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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && (newMessage.trim() || selectedFile)) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="min-h-screen max-h-screen p-2 md:p-4 flex items-center justify-center">
      <ImagePreview
        previewImage={previewImage}
        setPreviewImage={setPreviewImage}
      />
      <div className="w-full max-w-4xl h-[calc(100vh-2rem)] mx-auto bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="p-3 border-b border-slate-800/80 bg-slate-800/40 flex items-center sticky top-0 z-10">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-600/20 flex items-center justify-center mr-3">
                <MessageSquare className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  Support Chat
                </h1>
                <p className="text-sm text-slate-400">
                  Chat with our support team
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="absolute inset-0 overflow-y-auto p-4 messages-container scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
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
                      <p className="font-medium mb-2">Welcome to Support Chat!</p>
                      <p>No messages yet. Start a conversation with our team!</p>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef}></div>
                </div>
              )}
            </div>
          </div>

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
              <div className="flex-1">
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
        </div>
      </div>
    </div>
  );
};