import React from 'react';
import { ChatPage } from "../chat/ChatPage";

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
    isAdmin?: boolean;
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
                                                                          isAdmin = false
                                                                      }) => {
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
            handleFileSelect={handleFileSelect}
            setSelectedFile={setSelectedFile}
            isAdmin={isAdmin}
        />
    );
};