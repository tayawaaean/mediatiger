import { BanIcon, Check, Edit2, X as Close } from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import FadeInUp from "../components/FadeInUp";
import { useAuth } from "../contexts/AuthContext";

// UserRow type for users returned by get_users RPC
type UserRow = {
  id: string;
  user_id: string;
  email: string;
  raw_user_meta_data?: {
    avatar_url?: string;
    username?: string;
    full_name?: string;
    email_verified?: boolean;
    payment_enabled?: boolean;
    tipalti_id?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

const UsersPanel: React.FC = () => {
  const { isAdmin } = useAuth();
  const canEditSplit = isAdmin();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [banList, setBanList] = useState<string[]>([]);
  const [isEditingSplit, setIsEditingSplit] = React.useState(false);
  const [splitValue, setSplitValue] = React.useState("50");
  
  // Debug: Log when splitValue changes
  useEffect(() => {
    console.log('🔄 Split value state changed to:', splitValue);
  }, [splitValue]);

  // Updated to use filteredUsers for pagination
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) =>
      Object.values({
        username: user?.raw_user_meta_data?.username || "",
        email: user?.email || "",
        fullName: user?.raw_user_meta_data?.full_name || "",
      })
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);
  const getBanList = async () => {
    try {
      const { data, error } = await supabase.from("ban").select("user_id");

      if (error) {
        console.error("Error fetching ban list:", error);
        return;
      }

      // Extract user_ids from ban list data
      const bannedUserIds = data?.map((ban) => ban.user_id) || [];
      setBanList(bannedUserIds);
    } catch (error) {
      console.error("Error in getBanList:", error);
    }
  };
  useEffect(() => {
    getBanList();
  }, []);
  // Frontend pagination on filtered users
  const paginatedUsers: UserRow[] = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset page when search query changes
  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.rpc("get_users");

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load split from user_requests when a user is selected
  const loadSplit = async () => {
    if (!selectedUser?.user_id) return;
    
    console.log('🔍 Loading split for user:', selectedUser.user_id);
    
    const { data, error } = await supabase
      .from("user_requests")
      .select("split_percent")
      .eq("user_id", selectedUser.user_id)
      .single();

    console.log('📊 Split data response:', { data, error, split_percent: data?.split_percent });

    if (!error && data && data.split_percent !== null && data.split_percent !== undefined) {
      // Check if the value is actually a valid number
      const splitValue = Number(data.split_percent);
      if (!isNaN(splitValue) && splitValue >= 0 && splitValue <= 100) {
        console.log('✅ Setting split value to:', splitValue);
        setSplitValue(String(splitValue));
      } else {
        console.log('⚠️ Invalid split value, defaulting to 50:', splitValue);
        setSplitValue("50");
      }
    } else {
      console.log('❌ No split data found, defaulting to 50');
      setSplitValue("50");
    }
  };

  useEffect(() => {
    loadSplit();
    setIsEditingSplit(false);
  }, [selectedUser?.user_id]);

  const deleteUser = async (user: UserRow) => {
    try {
      console.log(user);
      const { data, error } = await supabase.rpc("delete_the_user", {
        tuid: user.user_id, // or any user UUID
      });

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        await fetchUsers();
        //  setUsers(data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total pages based on filtered users
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  async function setBlockedRequest(selectedUser: UserRow) {
    console.log("🚀 ~ setBlockedRequest ~ selectedUser:", selectedUser);

    try {
      // Update user in the frontend state

      // Check if user is already blocked
      const { data: existingBan } = await supabase
        .from("ban")
        .select("*")
        .eq("user_id", selectedUser.user_id)
        .single();

      if (existingBan) {
        // If user is blocked, delete the ban record
        const { error: deleteError } = await supabase
          .from("ban")
          .delete()
          .eq("user_id", selectedUser.user_id);

        if (deleteError) {
          console.error("Error removing ban:", deleteError);
          return;
        }
        setBanList(banList.filter((id) => id !== selectedUser.user_id));
      } else {
        // If user is not blocked, create a new ban record
        const { error: insertError } = await supabase
          .from("ban")
          .insert({ user_id: selectedUser.user_id });

        if (insertError) {
          console.error("Error creating ban:", insertError);
          return;
        }
        setBanList([...banList, selectedUser.user_id]);
      }

      // Refresh the users list to reflect changes
      await fetchUsers();
      await getBanList();
      // Update the selected user with the new data
    } catch (error) {
      console.log(error);
    }
  }

  const handleSplitSubmit = async () => {
    if (!canEditSplit || !selectedUser?.user_id) {
      console.log('❌ Cannot edit split:', { canEditSplit, userId: selectedUser?.user_id });
      setIsEditingSplit(false);
      return;
    }

    const value = Math.max(0, Math.min(100, Number(splitValue) || 0));
    console.log('🔧 Updating split for user:', selectedUser.user_id, 'to value:', value);

    const { data, error } = await supabase
      .from("user_requests")
      .update({ split_percent: value })
      .eq("user_id", selectedUser.user_id)
      .select('split_percent'); // Return the updated value

    console.log('📊 Split update response:', { data, error, updatedSplit: data?.[0]?.split_percent });

    if (error) {
      console.error("❌ Failed to update split_percent:", error);
      return;
    }

    // Verify the update was successful
    if (data && data[0]?.split_percent === value) {
      console.log('✅ Split updated successfully to:', value);
      setSplitValue(String(value));
      
      // Refresh the split value to ensure UI is in sync with database
      setTimeout(() => {
        loadSplit();
      }, 100);
    } else {
      console.log('⚠️ Split update may not have succeeded, expected:', value, 'got:', data?.[0]?.split_percent);
    }
    
    setIsEditingSplit(false);
  };

  // Debug function to check database state
  const debugDatabaseState = async () => {
    if (!selectedUser?.user_id) return;
    
    console.log('🔍 Debugging database state for user:', selectedUser.user_id);
    
    // Check user_requests table
    const { data: userRequests, error: userRequestsError } = await supabase
      .from("user_requests")
      .select("*")
      .eq("user_id", selectedUser.user_id);
    
    console.log('📊 user_requests data:', { userRequests, userRequestsError });
    
    // Check if there are multiple records
    if (userRequests && userRequests.length > 1) {
      console.log('⚠️ Multiple user_requests records found:', userRequests);
    }
  };

  return (
    <>
      <div className="w-full bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700/50">
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              placeholder="Search users..."
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-slate-400 mt-2">
              {filteredUsers.length} result
              {filteredUsers.length !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700/50">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-slate-700/50 divide-y divide-slate-600">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-slate-300"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-slate-300"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                paginatedUsers?.map((user, idx) => (
                  <FadeInUp key={user.id} delay={idx * 100} as="tr">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-slate-600 text-slate-200 flex items-center justify-center overflow-hidden">
                          <img
                            src={
                              user?.raw_user_meta_data?.avatar_url ||
                              "https://mellitahog.ly/en/wp-content/uploads/2021/09/randomUser.jpg"
                            }
                            alt="User avatar"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-200">
                            {user?.raw_user_meta_data?.username || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {user.email}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          banList.includes(user.user_id)
                            ? "bg-red-900/50 text-red-200"
                            : user?.raw_user_meta_data?.email_verified
                            ? "bg-emerald-900/50 text-emerald-200"
                            : "bg-slate-800/50 text-slate-300"
                        }`}
                      >
                        {banList.includes(user.user_id)
                          ? "Banned"
                          : user?.raw_user_meta_data?.email_verified
                          ? "Active"
                          : "Pending"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="px-3 py-1 text-sm text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-600 transition-colors"
                        onClick={() => {
                          setSelectedUser(user);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                    {/*Delete User*/}
                    <td className="px-3 py-4 whitespace-nowrap">
                      <button
                        className="px-3 py-1 text-sm text-slate-200 bg-red-600/20 hover:bg-red-600/30 rounded-md border border-slate-600 transition-colors"
                        onClick={() => {
                          deleteUser(user);
                        }}
                      >
                        Delete User
                      </button>
                    </td>
                  </FadeInUp>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-700/50 px-4 py-3 flex items-center justify-between border-t border-slate-600 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="relative inline-flex items-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-300">
                Showing{" "}
                <span className="font-medium">{page * rowsPerPage + 1}</span> -{" "}
                <span className="font-medium">
                  {Math.min((page + 1) * rowsPerPage, filteredUsers.length)}
                </span>{" "}
                of <span className="font-medium">{filteredUsers.length}</span>{" "}
                results
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(0);
                }}
                className="rounded-md border-slate-600 bg-slate-800 text-slate-200"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
              </select>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-2 py-1 border border-slate-600 rounded-md text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <span className="text-sm text-slate-300">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                  className="px-2 py-1 border border-slate-600 rounded-md text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedUser && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-auto p-4 bg-black/80 backdrop-blur-sm"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overscrollBehavior: "contain",
          }}
        >
          <FadeInUp duration={600}>
            <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="bg-slate-800/95 rounded-xl p-8 shadow-2xl border border-slate-700 relative">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-semibold text-slate-200">
                    User Details
                  </h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="text-right">
                  {canEditSplit && isEditingSplit ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={splitValue}
                        onChange={(e) => setSplitValue(e.target.value)}
                        className="w-20 rounded bg-[#1e2536] px-2 py-1 text-2xl text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                      />
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={handleSplitSubmit}
                          className="rounded bg-green-500/20 p-1 text-green-400 hover:bg-green-500/30"
                          title="Save split"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setIsEditingSplit(false)}
                          className="rounded bg-red-500/20 p-1 text-red-400 hover:bg-red-500/30"
                          title="Cancel edit"
                        >
                          <Close size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="group relative">
                      <div className="text-3xl font-bold text-blue-400">
                        {splitValue}%
                      </div>
                      <div className="flex items-center space-x-1">
                        {canEditSplit && (
                          <button
                            onClick={() => setIsEditingSplit(true)}
                            className="rounded p-1 opacity-0 transition-opacity hover:bg-gray-700 group-hover:opacity-100"
                            title="Edit split"
                          >
                            <Edit2 size={14} className="text-gray-400" />
                          </button>
                        )}
                        <button
                          onClick={loadSplit}
                          className="rounded p-1 opacity-0 transition-opacity hover:bg-gray-700 group-hover:opacity-100"
                          title="Refresh split from database"
                        >
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        <button
                          onClick={debugDatabaseState}
                          className="rounded p-1 opacity-0 transition-opacity hover:bg-gray-700 group-hover:opacity-100"
                          title="Debug database state"
                        >
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="text-sm text-gray-400">Current Split</div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-20 rounded-full bg-slate-700 overflow-hidden">
                      <img
                        src={
                          selectedUser.raw_user_meta_data?.avatar_url ||
                          "https://mellitahog.ly/en/wp-content/uploads/2021/09/randomUser.jpg"
                        }
                        alt="User avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-slate-200">
                        {selectedUser.raw_user_meta_data?.full_name || "N/A"}
                      </h3>
                      <p className="text-sm text-slate-400">
                        @{selectedUser.raw_user_meta_data?.username}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 bg-slate-700/30 rounded-xl backdrop-blur-sm">
                      <h4 className="mb-4 text-lg font-medium text-gray-300">
                        Summary
                      </h4>
                      <div className="space-y-3">
                        <p className=" text-slate-300">
                          <span className="text-slate-400">
                            Account Status:
                          </span>{" "}
                          {/* TODO: fix active/inactive status */}
                          <span
                            className={`w-3 h-3 rounded-full mr-3 ${
                              selectedUser.raw_user_meta_data?.payment_enabled
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          Active
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">Member Since:</span>{" "}
                          {/* TODO: fix data */}
                          March 15, 2023
                        </p>
                        <p className=" text-slate-300">
                          <span className="text-slate-400">Last Active:</span>{" "}
                          {/* TODO: fix data */}2 hours ago
                        </p>
                        <p className=" text-slate-300">
                          <span className="text-slate-400">
                            Total Channels:
                          </span>{" "}
                          {/* TODO: fix data */}0
                        </p>
                      </div>
                    </div>

                    {/* <span
                          className={`w-3 h-3 rounded-full mr-3 ${
                          selectedUser.raw_user_meta_data?.payment_enabled
                              ? "bg-green-500"
                              : "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                      /> */}

                    <div className="p-6 bg-slate-700/30 rounded-xl backdrop-blur-sm">
                      <h4 className="mb-4 text-lg font-medium text-gray-300">
                        Payment Information
                      </h4>
                      <div className="space-y-3">
                        <p className="text-sm text-slate-300">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">
                              Total Earnings:
                            </span>
                            {/* {selectedUser.raw_user_meta_data?.tipalti_id || "N/A"} */}
                            {/* TODO: fix data */}
                            <span className="text-xl font-semibold text-green-400">
                              $12,450.00
                            </span>
                          </div>
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-gray-400">This Month:</span>
                          <span className="text-lg font-medium text-green-400">
                            $850.00
                          </span>
                        </div>

                        <div className="mt-1 flex items-center justify-between pl-4">
                          <span className="text-sm text-gray-400">
                            Channel Earnings:
                          </span>
                          <span className="text-sm text-green-400">
                            $650.00
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between pl-4">
                          <span className="text-sm text-gray-400">
                            Affiliate Channel Earnings:
                          </span>
                          <span className="text-sm text-green-400">
                            $200.00
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-gray-400">Tipalti ID:</span>
                          <span>
                            {selectedUser.raw_user_meta_data?.tipalti_id ||
                              "N/A"}
                          </span>
                        </div>

                        <div className="mb-2 text-gray-400 text-center">
                          Recent Payouts
                        </div>
                        <div className="max-h-32 space-y-2 overflow-y-auto rounded bg-[#1e2536] p-2">
                          <div className="flex justify-between">
                            <span>Mar 1, 2024</span>
                            <span className="text-green-400">$2,300.00</span>
                          </div>

                          <div className="flex justify-between">
                            <span>Feb 1, 2024</span>
                            <span className="text-green-400">$1,850.00</span>
                          </div>

                          <div className="flex justify-between">
                            <span>Jan 1, 2024</span>
                            <span className="text-green-400">$2,100.00</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-center">
                          <span
                            className={`w-3 h-3 rounded-full mr-3 ${
                              selectedUser.raw_user_meta_data?.payment_enabled
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span className="text-sm text-slate-300">
                            Payment Enabled
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-700/30 rounded-xl backdrop-blur-sm">
                      <h4 className="mb-4 text-lg font-medium text-gray-300">
                        Channel Management
                      </h4>

                      <div className="mb-2 text-gray-400 text-center">
                        Active Channels
                      </div>
                      <div className="max-h-32 space-y-2 overflow-y-auto rounded bg-[#1e2536] p-2">
                        <a
                          href="https://youtube.com/@mainchannel"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center rounded px-2 py-1 hover:shadow-lg hover:shadow-blue-500/20 hover:bg-blue-500/5 transition-all duration-300 border border-transparent hover:border-blue-500/30"
                        >
                          <span className="text-blue-400 hover:underline">
                            @mainchannel
                          </span>
                          {/* <CheckCircle2 size={16} className="ml-1 text-green-500" /> */}
                        </a>
                      </div>

                      <div className="mb-2 text-gray-400 text-center mt-4">
                        Affiliate Channels
                      </div>
                      <div className="max-h-32 space-y-2 overflow-y-auto rounded bg-[#1e2536] p-2">
                        <a
                          href="https://youtube.com/@mainchannel"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center rounded px-2 py-1 hover:shadow-lg hover:shadow-blue-500/20 hover:bg-blue-500/5 transition-all duration-300 border border-transparent hover:border-blue-500/30"
                        >
                          <span className="text-blue-400 hover:underline">
                            @mainchannel
                          </span>
                          {/* <CheckCircle2 size={16} className="ml-1 text-green-500" /> */}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* leaving this commented out for future reference */}
                {/* <button
                      className={`flex items-center gap-2 flew-row px-4 py-2 rounded-md text-sm font-medium ${
                      banList.includes(selectedUser.user_id)
                          ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                          : "bg-slate-600/50 text-slate-300 hover:bg-slate-600"
                      }`}
                      onClick={() => {
                      // Add your block user logic here
                      setBlockedRequest(selectedUser);
                      console.log("Block user clicked");
                      }}
                  >
                      {banList.includes(selectedUser.user_id)
                      ? "Unblock"
                      : "Block"}
                      <BanIcon size={16} />
                  </button> */}

                <div className="flex items-center justify-between animate-section mt-4">
                  <button
                    className="flex items-center rounded bg-red-600/20 px-4 py-2 text-red-400 transition hover:bg-red-600/30"
                    onClick={() => {
                      setBlockedRequest(selectedUser);
                      console.log("Block user clicked");
                    }}
                  >
                    <BanIcon className="mr-2" size={16} />
                    <span>Ban User</span>
                  </button>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="rounded bg-gray-700 px-6 py-2 text-white transition hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </FadeInUp>
        </div>
      )}
    </>
  );
};

export default UsersPanel;
