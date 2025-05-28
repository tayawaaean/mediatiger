import { MessageSquare } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AdminMessagesView } from "../components/messages/AdminMessagesView";
import { NormalMessagesView } from "../components/messages/NormalMessagesView";
import { useAuth } from "../contexts/AuthContext";
import { adminId } from "../features/admin/pages/AdminPanel";
import { supabase } from "../lib/supabase";

interface AdminUser {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
  };
}

export default function Messages() {
  const { user } = useAuth();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add new state for users, selected user, and search
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if current user is admin
  const isAdmin = user?.user_metadata?.role === "admin";

  const fetchUsers = async () => {
    if (!user || !isAdmin) return;

    try {
      // First, get all messages involving the admin
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        return;
      }

      console.log("Admin messages:", messages);
      console.log("Admin ID:", user.id);

      // Get all user IDs that have messaged with admin (excluding admin themselves)
      const messageUserIds = [
        ...new Set(
          messages
            ?.flatMap((m) => [m.sender_id, m.receiver_id])
            .filter((id) => id !== user.id) // Exclude admin's own ID
        ),
      ];

      console.log("Message user IDs:", messageUserIds);

      if (messageUserIds.length === 0) {
        console.log("No users found with messages");
        setUsers([]);
        return;
      }

      // Get user data from auth.users using RPC function
      const { data: authUsers, error: authError } = await supabase.rpc(
        "get_users_by_ids",
        { user_ids: messageUserIds }
      );

      if (authError) {
        console.error("Error fetching auth users:", authError);
        console.error("Auth error details:", authError);
        return;
      }

      console.log("Auth users:", authUsers);

      // Create user objects with data from auth.users
      const usersWithMessages = messageUserIds.map((userId) => {
        const authUser = authUsers?.find((u) => u.id === userId);

        // Find the most recent message for this user
        const userMessages =
          messages?.filter(
            (m) => m.sender_id === userId || m.receiver_id === userId
          ) || [];

        const lastMessage = userMessages[0]; // Already sorted by created_at desc

        console.log(`User ${userId} auth data:`, authUser);
        console.log(`Raw meta data:`, authUser?.raw_user_meta_data);

        // Create user object from auth data
        const userObject = {
          id: userId,
          email: authUser?.email || `user-${userId.slice(0, 8)}`,
          full_name:
            authUser?.raw_user_meta_data?.fullname ||
            authUser?.raw_user_meta_data?.full_name ||
            authUser?.email?.split("@")[0] ||
            `User ${userId.slice(0, 8)}`,
          user_metadata: authUser?.raw_user_meta_data || { role: "user" },
        };

        console.log(`Final user object for ${userId}:`, userObject);

        return {
          ...userObject,
          last_message: lastMessage?.content || "",
          last_message_time: lastMessage?.created_at || "",
        };
      });

      // Sort by most recent message
      const sortedUsers = usersWithMessages.sort(
        (a, b) =>
          new Date(b.last_message_time).getTime() -
          new Date(a.last_message_time).getTime()
      );

      console.log("Final sorted users:", sortedUsers);

      setUsers(sortedUsers);
      if (!selectedUser && sortedUsers.length > 0) {
        setSelectedUser(sortedUsers[0]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchMessages = async () => {
    if (!user) {
      console.log("No user found");
      return;
    }

    try {
      let query;

      if (isAdmin && selectedUser) {
        // Admin viewing conversation with specific user
        query = supabase
          .from("messages")
          .select("*")
          .or(
            `and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id})`
          )
          .order("created_at", { ascending: true });
      } else {
        // Regular user or admin without selected user - conversation with admin
        query = supabase
          .from("messages")
          .select("*")
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${adminId}),and(sender_id.eq.${adminId},receiver_id.eq.${user.id})`
          )
          .order("created_at", { ascending: true });
      }

      console.log("Fetching messages for:", {
        userId: user.id,
        isAdmin,
        selectedUser: selectedUser?.id,
        adminId,
      });

      const { data: messages, error } = await query;

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      console.log("Fetched messages:", messages);
      setMessages(messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSendMessage = async () => {
    if (!user || (!newMessage.trim() && !selectedFile)) {
      console.log("Cannot send message: no user or empty message");
      return;
    }

    try {
      let fileUrl = "";
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from("message-images")
          .upload(filePath, selectedFile);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("message-images").getPublicUrl(filePath);

        fileUrl = publicUrl;
      }

      const messageData = {
        sender_id: user.id,
        receiver_id: isAdmin ? selectedUser?.id : adminId,
        content: newMessage.trim(),
        image_url: fileUrl || null,
        created_at: new Date().toISOString(),
      };

      console.log("Sending message:", messageData);

      const { error } = await supabase.from("messages").insert([messageData]);

      if (error) {
        console.error("Error inserting message:", error);
        throw error;
      }

      setNewMessage("");
      setSelectedFile(null);
      setIsModalOpen(false);

      // Fetch messages again to update the UI
      await fetchMessages();

      // If admin, also refresh users list to update last message
      if (isAdmin) {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      console.log("Loading data for user:", user);

      try {
        if (isAdmin) {
          await fetchUsers();
        }
        // Always fetch messages
        await fetchMessages();
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, isAdmin]); // Added isAdmin dependency

  // Fetch messages when selectedUser changes (for admin)
  useEffect(() => {
    if (user && isAdmin && selectedUser) {
      console.log("Selected user changed, fetching messages");
      fetchMessages();
    }
  }, [selectedUser]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    console.log("Setting up real-time subscription");

    const channel = supabase.channel("messages");

    let filter;
    if (isAdmin && selectedUser) {
      filter = `sender_id=eq.${selectedUser.id} AND receiver_id=eq.${user.id} OR sender_id=eq.${user.id} AND receiver_id=eq.${selectedUser.id}`;
    } else {
      filter = `sender_id=eq.${user.id} AND receiver_id=eq.${adminId} OR sender_id=eq.${adminId} AND receiver_id=eq.${user.id}`;
    }

    const subscription = channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          console.log("Real-time message update:", payload);
          fetchMessages();
          if (isAdmin) {
            fetchUsers(); // Update users list to show new last message
          }
        }
      )
      .subscribe();

    return () => {
      console.log("Unsubscribing from real-time updates");
      subscription.unsubscribe();
    };
  }, [user, selectedUser, isAdmin]);

  // Early returns
  if (!user) {
    console.log("No user, returning null");
    return null;
  }

  // Group messages helper function
  const getGroupedMessages = () => {
    if (!messages.length) return [];

    return messages.map((message, index) => {
      // Check if this message should be grouped with the previous one
      const prevMessage = index > 0 ? messages[index - 1] : null;

      // Group messages if:
      // 1. Same sender
      // 2. Within 5 minutes of each other
      const shouldGroup =
        prevMessage &&
        prevMessage.sender_id === message.sender_id &&
        new Date(message.created_at).getTime() -
          new Date(prevMessage.created_at).getTime() <
          5 * 60 * 1000;

      return {
        ...message,
        shouldGroup,
      };
    });
  };

  const renderMessage = (message: any) => {
    const isCurrentUser = message.sender_id === user?.id;
    const messageTime = new Date(message.created_at);
    const formattedTime = messageTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Use the shouldGroup property from our enhanced message object
    const shouldGroup = message.shouldGroup;

    return (
      <div
        key={message.id}
        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} ${
          shouldGroup ? "mt-1" : "mt-3"
        }`}
      >
        {!isCurrentUser && !shouldGroup && (
          <div className="h-8 w-8 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0 mr-2">
            <MessageSquare className="h-4 w-4 text-indigo-400" />
          </div>
        )}
        {!isCurrentUser && shouldGroup && <div className="w-8 mr-2"></div>}

        <div
          className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${
            isCurrentUser ? "items-end" : "items-start"
          }`}
        >
          {!shouldGroup && (
            <div
              className={`flex items-center mb-1 ${
                isCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isCurrentUser && (
                <span className="text-xs sm:text-sm font-medium text-indigo-400 mr-2">
                  {isAdmin
                    ? selectedUser?.full_name || selectedUser?.email
                    : "Support Team"}
                </span>
              )}
              <span className="text-xs text-slate-500">{formattedTime}</span>
            </div>
          )}

          <div
            className={`rounded-lg px-3 py-2 ${
              isCurrentUser
                ? "bg-indigo-600 text-white"
                : "bg-slate-700/80 text-slate-200"
            } ${!shouldGroup && isCurrentUser ? "rounded-tr-sm" : ""} ${
              !shouldGroup && !isCurrentUser ? "rounded-tl-sm" : ""
            } hover:shadow-md transition-colors duration-200`}
          >
            <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
            {message.image_url && (
              <div className="mt-2 overflow-hidden">
                <img
                  src={message.image_url}
                  alt="Message attachment"
                  className="max-w-full rounded-md cursor-pointer hover:opacity-90 transition-colors"
                  style={{
                    maxWidth: "250px",
                    maxHeight: "200px",
                    objectFit: "contain",
                  }}
                  onClick={() => setPreviewImage(message.image_url)}
                />
              </div>
            )}
            {shouldGroup && (
              <span className="text-xs opacity-50 mt-1 inline-block ml-1">
                {formattedTime}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const messageContainer = document.querySelector(".messages-container");
      if (messageContainer) {
        setTimeout(() => {
          messageContainer.scrollTop = messageContainer.scrollHeight;
        }, 100);
      }
    }
  }, [messages]);

  // Debug logging
  console.log("Component render:", {
    isAdmin,
    selectedUser: selectedUser?.id,
    messagesCount: messages.length,
    isLoading,
  });

  if (isAdmin) {
    // Filter users based on search term
    const filteredUsers = users.filter(
      (u) =>
        u.id !== adminId &&
        (u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Group messages before rendering
    const groupedMessages = getGroupedMessages();

    return (
      <div className="h-full">
        <AdminMessagesView
          filteredUsers={filteredUsers}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          messages={groupedMessages}
          isLoading={isLoading}
          handleSendMessage={handleSendMessage}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          handleFileSelect={handleFileSelect}
          previewImage={previewImage}
          setPreviewImage={setPreviewImage}
          renderMessage={renderMessage}
          messagesEndRef={messagesEndRef}
        />
      </div>
    );
  }

  // Group messages before rendering for normal view too
  const groupedMessages = getGroupedMessages();

  return (
    <NormalMessagesView
      previewImage={previewImage}
      setPreviewImage={setPreviewImage}
      isLoading={isLoading}
      messages={groupedMessages}
      renderMessage={renderMessage}
      messagesEndRef={messagesEndRef}
      newMessage={newMessage}
      setNewMessage={setNewMessage}
      handleSendMessage={handleSendMessage}
      selectedFile={selectedFile}
      handleFileSelect={handleFileSelect}
      setSelectedFile={setSelectedFile}
    />
  );
}
