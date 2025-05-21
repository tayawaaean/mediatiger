import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useMessages(user) {
  const [showMessages, setShowMessage] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Effect to check for unread messages
  useEffect(() => {
    if (!user) return;

    const checkUnreadMessages = async () => {
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .eq("receiver_id", user.id)
        .is("read_at", null);

      if (error) {
        console.error("Error checking unread messages:", error);
        return;
      }

      setHasUnreadMessages(messages && messages.length > 0);
    };

    checkUnreadMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          checkUnreadMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    showMessages,
    setShowMessage,
    hasUnreadMessages,
  };
}
