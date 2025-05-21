import * as React from "react";
import { useState, useEffect } from "react";
import { Bell, Users, Send, Check, ChevronDown, X } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Checkbox } from "../ui/checkbox";
import { toast } from "react-hot-toast";
import { supabase } from "../../lib/supabase";

// Simple User type definition
interface User {
  id: string;
}

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
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [progress, setProgress] = useState<{ current: number, total: number } | null>(null);
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = allUsers.filter(user =>
      user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to fetch all users directly from profiles
  const fetchUsers = async () => {
    setDebugInfo("Fetching users...");
    try {
      // First try to get just the IDs from profiles
      const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id');

      if (profilesError) {
        setDebugInfo(prev => prev + `\nError fetching profiles: ${JSON.stringify(profilesError)}`);
      } else {
        // If successful, use these IDs
        const userIds = profilesData.map(profile => profile.id);
        setDebugInfo(prev => prev + `\nFetched ${userIds.length} user IDs from profiles table`);

        // Create simple user objects from the IDs
        const users = userIds.map(id => ({ id }));
        setAllUsers(users);

        // Log a sample of users found
        if (users.length > 0) {
          setDebugInfo(prev => prev + `\nSample user IDs: ${users.slice(0, 3).map(u => u.id).join(', ')}${users.length > 3 ? '...' : ''}`);
        }

        return users;
      }

      // If we get here, something went wrong with the profiles query
      setDebugInfo(prev => prev + `\nFallback: trying to get current user`);

      // Fallback to just the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const users = [{ id: user.id }];
        setAllUsers(users);
        setDebugInfo(prev => prev + `\nAdded current user as fallback: ${user.id}`);
        return users;
      }

      // If we get here, we couldn't get any users
      setDebugInfo(prev => prev + `\nCouldn't find any users!`);
      return [];
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      setDebugInfo(prev => prev + `\nException in fetchUsers: ${error}`);
      return [];
    }
  };

  // Function to handle selecting/deselecting all users
  const handleSelectAllUsers = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(allUsers);
    } else {
      setSelectedUsers([]);
    }
  };

  // Function to toggle selection for a single user
  const toggleUserSelection = (user: User) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Direct insert function for notifications
  const directInsertNotification = async (notifData: any, targetUserId: string) => {
    try {
      // Create notification directly using INSERT
      const { data, error } = await supabase
          .from("notifications")
          .insert({
            title: notifData.title,
            content: notifData.content,
            type: notifData.type || "info",
            user_id: targetUserId,
            read: false
          })
          .select();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Exception in directInsertNotification:", error);
      throw error;
    }
  };

  // Function to send to selected users
  const sendToSelectedUsers = async (notificationData: any) => {
    const usersToNotify = selectedUsers;

    if (usersToNotify.length === 0) {
      setDebugInfo("No users selected. Cannot send notifications.");
      return { success: 0, failure: 0 };
    }

    setDebugInfo(`Preparing to send to ${usersToNotify.length} selected users...`);

    let successCount = 0;
    let failureCount = 0;
    let processed = 0;

    // Process in batches
    const batchSize = 5;
    const totalBatches = Math.ceil(usersToNotify.length / batchSize);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, usersToNotify.length);
      const batch = usersToNotify.slice(start, end);

      setDebugInfo(prev => prev + `\n\nProcessing batch ${batchIndex + 1}/${totalBatches} (${batch.length} users)`);

      // Process each user in the batch
      for (const user of batch) {
        try {
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));

          setProgress({ current: processed + 1, total: usersToNotify.length });

          // Try direct insert first, then fallback to hook method
          try {
            await directInsertNotification(notificationData, user.id);
            setDebugInfo(prev => prev + `\nSent to user ID: ${user.id} (direct insert)`);
          } catch (directError) {
            await addNotification(notificationData, user.id);
            setDebugInfo(prev => prev + `\nSent to user ID: ${user.id} (hook method)`);
          }

          successCount++;
        } catch (error) {
          failureCount++;
          setDebugInfo(prev => prev + `\nFailed to send to user ID: ${user.id}: ${error}`);
        }

        processed++;
      }

      // Add a slightly longer delay between batches
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    return { success: successCount, failure: failureCount };
  };

  // Function to send to all users
  const sendToAllUsers = async (notificationData: any) => {
    if (allUsers.length === 0) {
      await fetchUsers();
      setSelectedUsers(allUsers);
    } else {
      setSelectedUsers(allUsers);
    }
    return sendToSelectedUsers(notificationData);
  };

  // Function to send a notification to yourself
  const sendSelfNotification = async (notifData: any) => {
    try {
      setDebugInfo(`\nSending notification to self`);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
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
            read: false
          })
          .select();

      if (error) {
        throw error;
      }

      setDebugInfo(prev => prev + `\nSelf notification success`);
      return data;
    } catch (error) {
      setDebugInfo(prev => prev + `\nException in sendSelfNotification: ${error}`);
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
        // Send to all users
        const { success, failure } = await sendToAllUsers(notificationData);

        if (failure > 0 && success > 0) {
          toast.warning(`Sent ${success} notifications, failed to send ${failure}`);
        } else if (success > 0) {
          toast.success(`Sent notification to ${success} users`);
        } else {
          toast.error("Failed to send any notifications");
        }
      } else if (selectedUsers.length > 0) {
        // Send to selected users
        const { success, failure } = await sendToSelectedUsers(notificationData);

        if (failure > 0 && success > 0) {
          toast.warning(`Sent ${success} notifications, failed to send ${failure}`);
        } else if (success > 0) {
          toast.success(`Sent notification to ${success} users`);
        } else {
          toast.error("Failed to send any notifications");
        }
      } else if (userId) {
        // Send to specific user by ID
        setDebugInfo(prev => prev + `\nSending to specific user: ${userId}`);

        try {
          // Try direct insert first
          try {
            await directInsertNotification(notificationData, userId);
            toast.success("Notification sent successfully");
          } catch (directError) {
            // Try the hook method as a fallback
            await addNotification(notificationData, userId);
            toast.success("Notification sent successfully (via hook)");
          }
        } catch (error) {
          toast.error("Failed to send notification");
          setDebugInfo(prev => prev + `\nFailed to send notification: ${error}`);
        }
      } else {
        // Send to current admin (test notification)
        try {
          await sendSelfNotification(notificationData);
          toast.success("Test notification sent to yourself");
        } catch (error) {
          toast.error("Failed to send notification to yourself");
          setDebugInfo(prev => prev + `\nFailed to send self notification: ${error}`);
        }
      }

      // Reset form
      setTitle("");
      setContent("");
      setType("info");
    } catch (error) {
      console.error("Error sending notification:", error);
      setDebugInfo(prev => prev + `\nFinal error: ${error}`);
      toast.error("Failed to send notification");
    } finally {
      setIsSending(false);
      setProgress(null);
    }
  };

  // Check permissions to diagnose issues
  const checkPermissions = async () => {
    setDebugInfo("Checking permissions...");
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setDebugInfo(prev => prev + `\nCurrent user: ${user?.id}`);

      // Check if notifications table exists
      try {
        const { data: notifCheck, error: notifError } = await supabase
            .from('notifications')
            .select('*')
            .limit(1);

        if (notifError) {
          setDebugInfo(prev => prev + `\nCannot query notifications: ${JSON.stringify(notifError)}`);
        } else {
          setDebugInfo(prev => prev + `\nCan query notifications: ${notifCheck?.length} results`);
          setDebugInfo(prev => prev + `\nColumn structure: ${Object.keys(notifCheck[0] || {}).join(', ')}`);
        }
      } catch (e) {
        setDebugInfo(prev => prev + `\nException querying notifications: ${e}`);
      }

      // Check RLS policies
      try {
        // Try inserting for a different user
        const testUserId = allUsers.length > 0 && allUsers[0].id !== user?.id
            ? allUsers[0].id
            : "00000000-0000-0000-0000-000000000000"; // Fallback

        const testData = {
          title: "Test Notification",
          content: "Testing permissions",
          type: "info",
          user_id: testUserId,
          read: false
        };

        const { data: insertData, error: insertError } = await supabase
            .from('notifications')
            .insert(testData)
            .select();

        if (insertError) {
          setDebugInfo(prev => prev + `\nCannot insert notification for other user: ${JSON.stringify(insertError)}`);
          setDebugInfo(prev => prev + `\nYou need to update your RLS policies to allow cross-user notifications:`);
          setDebugInfo(prev => prev + `\n
-- Run this in SQL Editor to allow sending to other users:
CREATE POLICY "Allow insert for any user" ON notifications FOR INSERT WITH CHECK (true);
          `);
        } else {
          setDebugInfo(prev => prev + `\nCan insert notification for other user: Success!`);

          // Clean up test notification
          if (insertData && insertData.length > 0) {
            await supabase
                .from('notifications')
                .delete()
                .eq('id', insertData[0].id);
          }
        }
      } catch (e) {
        setDebugInfo(prev => prev + `\nException testing cross-user insert: ${e}`);
      }
    } catch (error) {
      setDebugInfo(prev => prev + `\nPermission check error: ${error}`);
    }
  };

  return (
      <div className="rounded-xl border border-slate-800/20 bg-slate-900/40 backdrop-blur-xl shadow-lg shadow-black/10">
        <div className="border-b border-slate-800/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-slate-200">Send Notification</h2>
            <span className="text-sm text-slate-500">
            {sendToAll
                ? `(Send to all ${allUsers.length} users)`
                : selectedUsers.length > 0
                    ? `(Send to ${selectedUsers.length} selected users)`
                    : "(Send to selected users or yourself)"}
          </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-slate-500" />
            <div className="flex items-center gap-2">
              <Switch
                  id="send-all"
                  checked={sendToAll}
                  onCheckedChange={(checked) => {
                    setSendToAll(checked);
                    if (checked) {
                      setSelectedUsers(allUsers);
                    }
                  }}
                  className="data-[state=checked]:bg-indigo-600"
              />
              <Label htmlFor="send-all" className="text-sm text-slate-300">
                Send to all users
              </Label>
            </div>
          </div>

          {!sendToAll && (
              <div className="space-y-2">
                <Label className="text-sm text-slate-400">
                  Select Recipients
                </Label>

                <div className="flex flex-col gap-2">
                  {/* Multi-select user dropdown */}
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                          variant="outline"
                          role="combobox"
                          className="justify-between bg-slate-800/20 border-slate-700/20 text-slate-200 w-full"
                      >
                        {selectedUsers.length > 0
                            ? `${selectedUsers.length} users selected`
                            : "Select users..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-full min-w-[320px] max-h-[400px] overflow-auto">
                      <div className="p-2 border-b border-slate-700/20 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
                        <Input
                            placeholder="Search user IDs..."
                            className="bg-slate-800/40 border-slate-700/30"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="mt-2 flex items-center">
                          <Checkbox
                              id="select-all"
                              checked={selectedUsers.length === allUsers.length}
                              onCheckedChange={handleSelectAllUsers}
                              className="mr-2"
                          />
                          <Label htmlFor="select-all" className="text-sm text-slate-300">
                            Select All
                          </Label>
                        </div>
                      </div>
                      <div className="max-h-[300px] overflow-auto">
                        {filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-slate-500">No users found</div>
                        ) : (
                            filteredUsers.map(user => (
                                <div
                                    key={user.id}
                                    className="flex items-center px-2 py-2 hover:bg-slate-800/40 cursor-pointer"
                                    onClick={() => toggleUserSelection(user)}
                                >
                                  <Checkbox
                                      checked={selectedUsers.some(u => u.id === user.id)}
                                      className="mr-2"
                                      onCheckedChange={() => toggleUserSelection(user)}
                                  />
                                  <div className="flex flex-col">
                            <span className="text-sm text-slate-200">
                              {user.id}
                            </span>
                                  </div>
                                </div>
                            ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Selected users display */}
                  {selectedUsers.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedUsers.map(user => (
                            <div
                                key={user.id}
                                className="flex items-center bg-slate-800/40 text-slate-200 text-xs px-2 py-1 rounded-full"
                            >
                              <span className="max-w-[150px] truncate">{user.id}</span>
                              <button
                                  type="button"
                                  onClick={() => toggleUserSelection(user)}
                                  className="ml-1 text-slate-400 hover:text-slate-200"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                        ))}
                        {selectedUsers.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setSelectedUsers([])}
                                className="text-xs text-slate-400 hover:text-slate-200"
                            >
                              Clear all
                            </button>
                        )}
                      </div>
                  )}

                  {/* Or enter a specific user ID */}
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-700/30"></span>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-slate-900/40 backdrop-blur-sm px-2 text-slate-400">Or</span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <Label htmlFor="user-id" className="text-sm text-slate-400">
                      Enter User ID <span className="text-slate-500">(Leave empty to send to yourself)</span>
                    </Label>
                    <Input
                        id="user-id"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="Enter user ID"
                        className="bg-slate-800/20 border-slate-700/20 text-slate-200 placeholder:text-slate-500 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>
          )}

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

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm text-slate-400">
              Type
            </Label>
            <Select value={type} onValueChange={setType} defaultValue="info">
              <SelectTrigger className="bg-slate-800/20 border-slate-700/20 text-slate-200 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/90 border-slate-700/20 backdrop-blur-xl">
                <SelectItem value="info" className="text-slate-200">Info</SelectItem>
                <SelectItem value="success" className="text-slate-200">Success</SelectItem>
                <SelectItem value="warning" className="text-slate-200">Warning</SelectItem>
                <SelectItem value="error" className="text-slate-200">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {progress && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Sending notifications...</span>
                  <span>{progress.current} / {progress.total}</span>
                </div>
                <div className="w-full bg-slate-700/30 rounded-full h-2">
                  <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
                  ></div>
                </div>
              </div>
          )}

          <div className="pt-4 space-y-2">
            <Button
                type="submit"
                disabled={isSending}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSending
                  ? `Sending notifications...`
                  : "Send Notification"
              }
            </Button>

            <Button
                type="button"
                onClick={checkPermissions}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white"
            >
              Check Permissions
            </Button>
          </div>

          {debugInfo && (
              <div className="mt-4 p-3 bg-slate-800/50 rounded-md text-xs font-mono text-slate-300 whitespace-pre-wrap">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">Debug Information:</span>
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDebugInfo("")}
                      className="h-6 text-xs"
                  >
                    Clear
                  </Button>
                </div>
                {debugInfo}
              </div>
          )}
        </form>
      </div>
  );
}