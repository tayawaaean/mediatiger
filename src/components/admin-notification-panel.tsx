import * as React from "react";
import { useState, useEffect } from "react";
import { Bell, Users, Send } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { toast } from "react-hot-toast";
import { supabase } from "../lib/supabase";
import FadeInUp from "./FadeInUp";

export function AdminNotificationPanel() {
  // Get notification functions from the hook
  const { addNotification } = useNotifications();

  // Form state
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [type, setType] = useState<string>("info");
  const [userId, setUserId] = useState<string>("");
  const [sendToAll, setSendToAll] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [userIds, setUserIds] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  // Fetch all users when sendToAll is toggled on
  useEffect(() => {
    if (sendToAll) {
      fetchUsers();
    } else {
      setUserIds([]);
    }
  }, [sendToAll]);

  // Fixed fetchUsers function - with proper state management
  const fetchUsers = async () => {
    setDebugInfo("Fetching users...");
    let foundUserIds: string[] = [];

    try {
      // First try profiles table
      let { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id");

      if (profilesError) {
        setDebugInfo(
          (prev) =>
            prev +
            `\nError fetching from profiles table: ${JSON.stringify(
              profilesError
            )}`
        );

        // Try users table as fallback
        let { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id");

        if (usersError) {
          setDebugInfo(
            (prev) =>
              prev +
              `\nError fetching from users table: ${JSON.stringify(usersError)}`
          );
        } else if (usersData && usersData.length > 0) {
          foundUserIds = usersData.map((user) => user.id);
          setDebugInfo(
            (prev) =>
              prev + `\nFetched ${usersData.length} users from users table`
          );
        }
      } else if (profilesData && profilesData.length > 0) {
        foundUserIds = profilesData.map((user) => user.id);
        setDebugInfo(
          (prev) =>
            prev + `\nFetched ${profilesData.length} users from profiles table`
        );
      }

      // Important: Only update state after all attempts
      if (foundUserIds.length > 0) {
        setUserIds(foundUserIds);
        // Log the first few user IDs for debugging
        setDebugInfo(
          (prev) =>
            prev +
            `\nSample user IDs: ${foundUserIds.slice(0, 3).join(", ")}${
              foundUserIds.length > 3 ? "..." : ""
            }`
        );
      } else {
        setDebugInfo((prev) => prev + "\nNo user IDs found in any table!");

        // Try to get your own user ID at least
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.id) {
          foundUserIds = [user.id];
          setUserIds(foundUserIds);
          setDebugInfo(
            (prev) => prev + `\nAdded current user as fallback: ${user.id}`
          );
        }
      }

      return foundUserIds;
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      setDebugInfo((prev) => prev + `\nException in fetchUsers: ${error}`);
      return [];
    }
  };

  // Fixed sendToAllUsers function - properly waits for user ID fetching
  const sendToAllUsers = async (notificationData: any) => {
    setDebugInfo("Starting send to all users process...");

    // Get user IDs - if empty, fetch them first
    let usersToNotify = [...userIds]; // Create a copy to avoid state issues

    if (usersToNotify.length === 0) {
      setDebugInfo((prev) => prev + "\nNo users found, fetching users...");
      usersToNotify = await fetchUsers(); // Get the return value directly

      if (usersToNotify.length === 0) {
        setDebugInfo(
          (prev) =>
            prev +
            "\nStill no users found after fetching. Cannot send notifications."
        );
        return { success: 0, failure: 0 };
      }
    }

    setDebugInfo(
      (prev) => prev + `\nPreparing to send to ${usersToNotify.length} users...`
    );

    let successCount = 0;
    let failureCount = 0;
    let processed = 0;

    // Use smaller batches and add delays between requests
    const batchSize = 5;
    const totalBatches = Math.ceil(usersToNotify.length / batchSize);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, usersToNotify.length);
      const batch = usersToNotify.slice(start, end);

      setDebugInfo(
        (prev) =>
          prev +
          `\n\nProcessing batch ${batchIndex + 1}/${totalBatches} (${
            batch.length
          } users)`
      );

      // Process each user in the batch
      for (const id of batch) {
        try {
          // Add a small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 100));

          setProgress({ current: processed + 1, total: usersToNotify.length });

          // Try both methods - first direct insert, then hook method as fallback
          try {
            setDebugInfo(
              (prev) => prev + `\nAttempting direct insert for user ${id}...`
            );

            // Create notification directly using INSERT
            const { data, error } = await supabase
              .from("notifications")
              .insert({
                title: notificationData.title,
                content: notificationData.content,
                type: notificationData.type || "info",
                user_id: id,
                read: false,
              })
              .select();

            if (error) {
              throw error;
            }

            setDebugInfo(
              (prev) => prev + `\nDirect insert succeeded for user ${id}`
            );
          } catch (directError) {
            // If direct insert fails, try the hook method
            setDebugInfo(
              (prev) =>
                prev + `\nDirect insert failed for user ${id}: ${directError}`
            );
            setDebugInfo(
              (prev) => prev + `\nTrying hook method for user ${id}...`
            );

            await addNotification(notificationData, id);
            setDebugInfo(
              (prev) => prev + `\nHook method succeeded for user ${id}`
            );
          }

          successCount++;
        } catch (error) {
          failureCount++;
          setDebugInfo(
            (prev) => prev + `\nAll methods failed for user ${id}: ${error}`
          );
        }

        processed++;
      }

      // Add a slightly longer delay between batches
      if (batchIndex < totalBatches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return { success: successCount, failure: failureCount };
  };

  // Function to send a notification to yourself
  const sendSelfNotification = async (notifData: any) => {
    try {
      setDebugInfo((prev) => prev + `\nSending notification to self`);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

      // Create notification for yourself using normal insert
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          title: notifData.title,
          content: notifData.content,
          type: notifData.type || "info",
          user_id: user.id,
          read: false,
        })
        .select();

      if (error) {
        setDebugInfo(
          (prev) => prev + `\nSelf notification error: ${JSON.stringify(error)}`
        );
        throw error;
      }

      setDebugInfo(
        (prev) => prev + `\nSelf notification success: ${JSON.stringify(data)}`
      );
      return data;
    } catch (error) {
      setDebugInfo(
        (prev) => prev + `\nException in sendSelfNotification: ${error}`
      );
      throw error;
    }
  };

  // Submit handler to send notifications
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDebugInfo("Starting notification send process...");
    setProgress(null);

    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSending(true);

    try {
      const notificationData = {
        title,
        content,
        type: type as "info" | "success" | "warning" | "error",
      };

      if (sendToAll) {
        // Use the improved send to all function
        const { success, failure } = await sendToAllUsers(notificationData);

        if (failure > 0 && success > 0) {
          toast.warning(
            `Sent ${success} notifications, failed to send ${failure}`
          );
        } else if (success > 0) {
          toast.success(`Sent notification to ${success} users`);
        } else {
          toast.error("Failed to send any notifications");
        }
      } else if (userId) {
        // Send to specific user
        setDebugInfo((prev) => prev + `\nSending to specific user: ${userId}`);

        try {
          // Try direct insert first
          try {
            const { error } = await supabase.from("notifications").insert({
              title: notificationData.title,
              content: notificationData.content,
              type: notificationData.type || "info",
              user_id: userId,
              read: false,
            });

            if (error) throw error;
            toast.success("Notification sent successfully");
          } catch (directError) {
            // Try the hook method as a fallback
            setDebugInfo(
              (prev) => prev + `\nDirect insert failed: ${directError}`
            );
            await addNotification(notificationData, userId);
            toast.success("Notification sent successfully (via hook)");
          }
        } catch (error) {
          toast.error("Failed to send notification");
          setDebugInfo(
            (prev) => prev + `\nFailed to send notification: ${error}`
          );
        }
      } else {
        // Send to current admin (test notification)
        setDebugInfo((prev) => prev + "\nSending test notification to self");

        try {
          await sendSelfNotification(notificationData);
          toast.success("Test notification sent to yourself");
        } catch (error) {
          toast.error("Failed to send notification to yourself");
          setDebugInfo(
            (prev) => prev + `\nFailed to send self notification: ${error}`
          );
        }
      }

      // Reset form
      setTitle("");
      setContent("");
      setType("info");
      if (!sendToAll) {
        setUserId("");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      setDebugInfo((prev) => prev + `\nFinal error: ${error}`);
      toast.error("Failed to send notification");
    } finally {
      setIsSending(false);
      setProgress(null);
    }
  };

  // Diagnostic function to check permissions
  const checkPermissions = async () => {
    setDebugInfo("Checking permissions...");
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setDebugInfo((prev) => prev + `\nCurrent user: ${user?.id}`);

      // Check if notifications table exists
      try {
        const { data: notifCheck, error: notifError } = await supabase
          .from("notifications")
          .select("*")
          .limit(1);

        if (notifError) {
          setDebugInfo(
            (prev) =>
              prev +
              `\nCannot query notifications: ${JSON.stringify(notifError)}`
          );
        } else {
          setDebugInfo(
            (prev) =>
              prev + `\nCan query notifications: ${notifCheck?.length} results`
          );
        }
      } catch (e) {
        setDebugInfo(
          (prev) => prev + `\nException querying notifications: ${e}`
        );
      }

      // Check if we can insert to the notifications table
      if (user) {
        try {
          const testData = {
            title: "Test Notification",
            content: "Testing permissions",
            type: "info",
            user_id: user.id,
            read: false,
          };

          const { data: insertData, error: insertError } = await supabase
            .from("notifications")
            .insert(testData)
            .select();

          if (insertError) {
            setDebugInfo(
              (prev) =>
                prev +
                `\nCannot insert to notifications: ${JSON.stringify(
                  insertError
                )}`
            );
          } else {
            setDebugInfo(
              (prev) =>
                prev +
                `\nCan insert to notifications: ${JSON.stringify(insertData)}`
            );

            // Clean up test notification
            if (insertData && insertData[0]?.id) {
              await supabase
                .from("notifications")
                .delete()
                .eq("id", insertData[0].id);

              setDebugInfo((prev) => prev + `\nTest notification cleaned up`);
            }
          }
        } catch (e) {
          setDebugInfo((prev) => prev + `\nException testing insert: ${e}`);
        }
      }

      // Check if we can insert a notification for another user
      if (userId) {
        try {
          const testData = {
            title: "Test Cross-User Notification",
            content: "Testing permissions for sending to other users",
            type: "info",
            user_id: userId,
            read: false,
          };

          const { data: crossInsertData, error: crossInsertError } =
            await supabase.from("notifications").insert(testData).select();

          if (crossInsertError) {
            setDebugInfo(
              (prev) =>
                prev +
                `\nCannot insert notification for other user: ${JSON.stringify(
                  crossInsertError
                )}`
            );
            setDebugInfo(
              (prev) =>
                prev +
                `\nYou need to update your RLS policies to allow cross-user notifications:`
            );
            setDebugInfo(
              (prev) =>
                prev +
                `\n
-- Run this in SQL Editor to allow sending to other users:
CREATE POLICY "Allow insert for any user" ON notifications FOR INSERT WITH CHECK (true);
            `
            );
          } else {
            setDebugInfo(
              (prev) =>
                prev +
                `\nCan insert notification for other user: ${JSON.stringify(
                  crossInsertData
                )}`
            );

            // Clean up test notification
            if (crossInsertData && crossInsertData[0]?.id) {
              await supabase
                .from("notifications")
                .delete()
                .eq("id", crossInsertData[0].id);

              setDebugInfo(
                (prev) => prev + `\nCross-user test notification cleaned up`
              );
            }
          }
        } catch (e) {
          setDebugInfo(
            (prev) => prev + `\nException testing cross-user insert: ${e}`
          );
        }
      }
    } catch (error) {
      setDebugInfo((prev) => prev + `\nPermission check error: ${error}`);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800/20 bg-slate-900/40 backdrop-blur-xl shadow-lg shadow-black/10">
      <div className="border-b border-slate-800/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-slate-200">
            Send Notification
          </h2>
          <span className="text-sm text-slate-500">
            {sendToAll
              ? `(Send to all users: ${userIds.length} users)`
              : "(Send to individual user or yourself)"}
          </span>
        </div>
      </div>

      <FadeInUp delay={0}>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <FadeInUp delay={40}>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-slate-500" />
              <div className="flex items-center gap-2">
                <Switch
                  id="send-all"
                  checked={sendToAll}
                  onCheckedChange={setSendToAll}
                  className="data-[state=checked]:bg-indigo-600"
                />
                <Label htmlFor="send-all" className="text-sm text-slate-300">
                  Send to all users
                </Label>
              </div>
            </div>
          </FadeInUp>

          {!sendToAll && (
            <FadeInUp delay={80}>
              <div className="space-y-2">
                <Label htmlFor="user-id" className="text-sm text-slate-400">
                  User ID{" "}
                  <span className="text-slate-500">
                    (Leave empty to send to yourself)
                  </span>
                </Label>
                <Input
                  id="user-id"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter user ID"
                  className="bg-slate-800/20 border-slate-700/20 text-slate-200 placeholder:text-slate-500 backdrop-blur-sm"
                />
              </div>
            </FadeInUp>
          )}

          <FadeInUp delay={120}>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm text-slate-400">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
                className="bg-slate-800/20 border-slate-700/20 text-slate-200 placeholder:text-slate-500 backdrop-blur-sm"
                required
              />
            </div>
          </FadeInUp>

          <FadeInUp delay={160}>
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm text-slate-400">
                Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Notification content"
                className="bg-slate-800/20 border-slate-700/20 text-slate-200 placeholder:text-slate-500 min-h-[100px] backdrop-blur-sm"
                required
              />
            </div>
          </FadeInUp>

          <FadeInUp delay={200}>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm text-slate-400">
                Type
              </Label>
              <Select value={type} onValueChange={setType} defaultValue="info">
                <SelectTrigger className="bg-slate-800/20 border-slate-700/20 text-slate-200 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800/90 border-slate-700/20 backdrop-blur-xl">
                  <SelectItem value="info" className="text-slate-200">
                    Info
                  </SelectItem>
                  <SelectItem value="success" className="text-slate-200">
                    Success
                  </SelectItem>
                  <SelectItem value="warning" className="text-slate-200">
                    Warning
                  </SelectItem>
                  <SelectItem value="error" className="text-slate-200">
                    Error
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FadeInUp>

          {progress && (
            <FadeInUp delay={240}>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Sending notifications...</span>
                  <span>
                    {progress.current} / {progress.total}
                  </span>
                </div>
                <div className="w-full bg-slate-700/30 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{
                      width: `${Math.round(
                        (progress.current / progress.total) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </FadeInUp>
          )}

          <FadeInUp delay={280}>
            <div className="pt-4 space-y-2">
              <Button
                type="submit"
                disabled={isSending}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
              >
                <Send className="mr-2 h-4 w-4" />
                {isSending
                  ? `${sendToAll ? `Sending notifications...` : "Sending..."}`
                  : "Send Notification"}
              </Button>

              <Button
                type="button"
                onClick={checkPermissions}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white"
              >
                Check Permissions
              </Button>
            </div>
          </FadeInUp>

          {debugInfo && (
            <FadeInUp delay={320}>
              <div className="mt-4 p-3 bg-slate-800/50 rounded-md text-xs font-mono text-slate-300 whitespace-pre-wrap">
                <div className="mb-2 text-slate-400">Debug Information:</div>
                {debugInfo}
              </div>
            </FadeInUp>
          )}
        </form>
      </FadeInUp>
    </div>
  );
}
