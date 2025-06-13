import React, { Dispatch, SetStateAction } from "react";
import { ChatPage, Message, MessageInput } from "../chat/ChatPage";

interface NormalMessagesViewProps {
  previewImage: string | null;
  setPreviewImage: (url: string | null) => void;
  isLoading: boolean;
  messages: Message[];
  renderMessage: (message: Message) => React.ReactNode;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  newMessage: MessageInput;
  setNewMessage: Dispatch<SetStateAction<MessageInput>>;
  handleSendMessage: () => void;
  selectedFile: File | null;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedFile: (file: File | null) => void;
  isAdmin?: boolean;
  onTogglePin?: (messageId: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
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
  isAdmin = false,
  onTogglePin,
  onAddReaction,
}) => {
  // Convert handleFileSelect to match ChatPage's expected type
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

  return (
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
      isAdmin={isAdmin}
      onTogglePin={onTogglePin}
      onAddReaction={onAddReaction}
    />
  );
};
