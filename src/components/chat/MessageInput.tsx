import React, { useState } from 'react';
import { Send, X, Image } from 'lucide-react';
import { ImagePreview } from './ImagePreview';

interface MessageInputProps {
  onSendMessage: (content: string, file?: File) => void;
  isAdmin?: boolean;
  replyingTo?: {
    id: string;
    content: string;
  } | null;
  onCancelReply?: () => void;
  newMessage?: string;
  setNewMessage?: (message: string) => void;
  selectedFile?: File | null;
  onFileSelect?: (file: File) => void;
  onClearFile?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
                                                            onSendMessage,
                                                            isAdmin,
                                                            replyingTo,
                                                            onCancelReply,
                                                            newMessage: externalNewMessage,
                                                            setNewMessage: externalSetNewMessage,
                                                            selectedFile,
                                                            onFileSelect,
                                                            onClearFile,
                                                          }) => {
  // Internal state - used as fallback if external props not provided
  const [internalMessage, setInternalMessage] = useState('');
  const [internalImageFile, setInternalImageFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Use external props if provided, otherwise use internal state
  const message = externalNewMessage !== undefined ? externalNewMessage : internalMessage;
  const setMessage = externalSetNewMessage || setInternalMessage;

  // Determine which file to use
  const currentFile = selectedFile !== undefined ? selectedFile : internalImageFile;

  // Generate preview for current file
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (currentFile && currentFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(currentFile);
    } else {
      setImagePreview(null);
    }
  }, [currentFile]);

  // File handling function
  const handleFileChange = (file: File | null) => {
    if (onFileSelect && file) {
      // External file handling
      onFileSelect(file);
    } else if (onClearFile && !file) {
      // External clear
      onClearFile();
    } else {
      // Internal file handling
      setInternalImageFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileChange(file);
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileChange(file);
      }
    }
  };

  const removeImage = () => {
    handleFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || currentFile) {
      onSendMessage(message.trim(), currentFile || undefined);
      setMessage('');
      handleFileChange(null);
      onCancelReply?.();

      // Clear file input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
      <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-slate-700/50"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
      >
        {replyingTo && (
            <div className="mb-2 p-2 rounded bg-slate-800/50 border border-slate-700/50 flex items-start gap-2">
              <div className="flex-1">
                <p className="text-xs font-medium text-indigo-400 mb-0.5">Replying to:</p>
                <p className="text-sm text-slate-300 line-clamp-2">{replyingTo.content}</p>
              </div>
              <button
                  type="button"
                  onClick={onCancelReply}
                  className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-300 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
        )}

        {imagePreview && (
            <ImagePreview
                src={imagePreview}
                onRemove={removeImage}
                className="mb-4"
            />
        )}

        <div className="flex items-center gap-2">
          <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
          />
          <label
              htmlFor="image-upload"
              className="p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-400 hover:text-slate-300 hover:bg-slate-700 transition-all duration-200 cursor-pointer flex items-center justify-center"
              title="Upload image"
          >
            <Image size={20} />
          </label>
          <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className={`
            flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 
            text-base text-slate-200 placeholder:text-slate-400 
            focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
            transition-all duration-200
            ${dragActive ? 'ring-2 ring-indigo-500/50 border-indigo-500' : ''}
          `}
          />
          <button
              type="submit"
              disabled={!message.trim() && !currentFile}
              className="p-3 rounded-lg text-white hover:shadow-lg transition-all duration-200 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              title="Send message"
          >
            <Send size={20} />
          </button>
        </div>

        {dragActive && (
            <div className="absolute inset-0 bg-indigo-500/20 border-2 border-dashed border-indigo-500 rounded-lg flex items-center justify-center">
              <div className="text-indigo-300 text-lg font-medium">
                Drop image here to upload
              </div>
            </div>
        )}
      </form>
  );
};