import React, { useState } from "react";
import { Send, Image, X } from "lucide-react";
import { ImagePreview } from "../chat/ImagePreview";
import { MessageInput as MessageInputType } from "./ChatPage";
import { toast } from "react-hot-toast";

interface MessageInputProps {
  onSendMessage: (content: string, file?: File) => void;
  isAdmin?: boolean;
  replyingTo?: string | null;
  onCancelReply?: () => void;
  newMessage?: MessageInputType;
  setNewMessage?: (
    message: MessageInputType | ((prev: MessageInputType) => MessageInputType)
  ) => void;
  selectedFile?: File | null;
  onFileSelect?: (file: File) => void;
  onClearFile?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onCancelReply,
  newMessage: externalNewMessage,
  setNewMessage: externalSetNewMessage,
  selectedFile,
  onFileSelect,
  onClearFile,
}) => {
  // Internal state - used as fallback if external props not provided
  const [internalMessage, setInternalMessage] = useState<MessageInputType>({
    content: "",
    replyTo: "",
  });
  const [internalImageFile, setInternalImageFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Use external props if provided, otherwise use internal state
  const message =
    externalNewMessage !== undefined ? externalNewMessage : internalMessage;
  const setMessage = externalSetNewMessage || setInternalMessage;

  // Determine which file to use
  const currentFile =
    selectedFile !== undefined ? selectedFile : internalImageFile;

  // Generate preview for current file
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (currentFile && currentFile.type.startsWith("image/")) {
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image size should be less than 5MB");
          return;
        }
        handleFileChange(file);
      } else {
        toast.error("Please select an image file");
      }
    }
  };

  // Drag and drop handlers
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

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image size should be less than 5MB");
          return;
        }
        handleFileChange(file);
      } else {
        toast.error("Please drop an image file");
      }
    }
  };

  const removeImage = () => {
    handleFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.content.trim() || currentFile) {
      // If there's a file, ensure it's an image
      if (currentFile && !currentFile.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      onSendMessage(message.content.trim(), currentFile || undefined);
      setMessage({
        content: "",
        replyTo: "",
      });
      handleFileChange(null);
      onCancelReply?.();

      // Clear file input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {message.replyTo && (
        <div className="px-4 py-2 bg-slate-800/50 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-indigo-400 mb-0.5">
                Replying to:
              </p>
              <p className="text-sm text-slate-300 line-clamp-1">
                {message.replyTo}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMessage((prev: MessageInputType) => ({
                  ...prev,
                  replyTo: "",
                }));
                onCancelReply?.();
              }}
              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 p-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <Image className="h-5 w-5" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        <textarea
          value={message.content}
          onChange={(e) => setMessage({ ...message, content: e.target.value })}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className={`flex-1 bg-slate-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[40px] max-h-32 ${
            dragActive ? "ring-2 ring-indigo-500 border-indigo-500" : ""
          }`}
          rows={1}
        />
        <button
          type="submit"
          disabled={!message.content.trim() && !currentFile}
          className="p-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

      {imagePreview && (
        <div className="absolute bottom-full left-0 right-0 p-4 bg-slate-800/95 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <ImagePreview src={imagePreview} onRemove={removeImage} />
          </div>
        </div>
      )}
    </form>
  );
};
