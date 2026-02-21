import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../parts/sidebar';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:7000";
const PULSE_KEY = import.meta.env.VITE_PULSE_API_KEY;

function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function useCurrentUserId() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const decoded = decodeToken(token);
  return decoded?.sub || decoded?.id || decoded?.user_id || null;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "x-api-key": PULSE_KEY,
  };
}

const TAB_FRIENDS = "friends";
const TAB_PENDING = "pending";
const TAB_ADD = "add";

const Dashboard = () => {
  const token = localStorage.getItem("token");
  const userId = useCurrentUserId();

  const [tab, setTab] = useState(TAB_FRIENDS);
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);

  if (!token) return <Navigate to="/" />;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const setLoading = (id, val) =>
    setActionLoading((prev) => ({ ...prev, [id]: val }));

  const fetchFriends = useCallback(async () => {
    if (!userId) return;
    setLoadingFriends(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users/list`, { headers: authHeaders() });
      if (res.ok) setFriends(await res.json());
    } catch {}
    setLoadingFriends(false);
  }, [userId]);

  const fetchPending = useCallback(async () => {
    if (!userId) return;
    setLoadingPending(true);
    try {
      const res = await fetch(`${API_BASE}/friends/${userId}/pending`, { headers: authHeaders() });
      if (res.ok) setPending(await res.json());
    } catch {}
    setLoadingPending(false);
  }, [userId]);

  const fetchAllUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users/list`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.filter((u) => u.id !== userId));
      }
    } catch {}
    setLoadingUsers(false);
  }, [userId]);

  useEffect(() => {
    fetchFriends();
    fetchPending();
  }, [fetchFriends, fetchPending]);

  useEffect(() => {
    if (tab === TAB_ADD && allUsers.length === 0) fetchAllUsers();
  }, [tab, allUsers.length, fetchAllUsers]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    setSearchResults(allUsers.filter((u) => u.username.toLowerCase().includes(q)));
  }, [searchQuery, allUsers]);

  const sendRequest = async (targetId) => {
    setLoading(targetId, "adding");
    try {
      const res = await fetch(`${API_BASE}/friends/request`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ sender_id: userId, target_id: targetId }),
      });
      if (res.status === 201) {
        showToast("Friend request sent.");
      } else if (res.status === 409) {
        showToast("Request already exists.", "error");
      } else if (res.status === 403) {
        showToast("You are blocked by this user.", "error");
      } else {
        showToast("Failed to send request.", "error");
      }
    } catch {
      showToast("Connection error.", "error");
    }
    setLoading(targetId, null);
  };

  const acceptRequest = async (senderId) => {
    setLoading(senderId, "accepting");
    try {
      const res = await fetch(`${API_BASE}/friends/accept`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ acceptor_id: userId, sender_id: senderId }),
      });
      if (res.ok) {
        showToast("Friend request accepted.");
        fetchFriends();
        fetchPending();
      } else {
        showToast("Failed to accept.", "error");
      }
    } catch {
      showToast("Connection error.", "error");
    }
    setLoading(senderId, null);
  };

  const declineRequest = async (senderId) => {
    setLoading(senderId, "declining");
    try {
      const res = await fetch(`${API_BASE}/friends/decline`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ decliner_id: userId, sender_id: senderId }),
      });
      if (res.ok) {
        showToast("Request declined.");
        fetchPending();
      } else {
        showToast("Failed to decline.", "error");
      }
    } catch {
      showToast("Connection error.", "error");
    }
    setLoading(senderId, null);
  };

  const removeFriend = async (friendId) => {
    setLoading(friendId, "removing");
    try {
      const res = await fetch(`${API_BASE}/friends/remove`, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ user_id: userId, friend_id: friendId }),
      });
      if (res.ok) {
        showToast("Friend removed.");
        fetchFriends();
      } else {
        showToast("Failed to remove.", "error");
      }
    } catch {
      showToast("Connection error.", "error");
    }
    setLoading(friendId, null);
  };

  const blockUser = async (targetId) => {
    setLoading(targetId, "blocking");
    try {
      const res = await fetch(`${API_BASE}/friends/block`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ blocker_id: userId, target_id: targetId }),
      });
      if (res.ok) {
        showToast("User blocked.");
        fetchFriends();
      } else {
        showToast("Failed to block.", "error");
      }
    } catch {
      showToast("Connection error.", "error");
    }
    setLoading(targetId, null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const Avatar = ({ username, pfp_url, size = 36 }) => (
    pfp_url ? (
      <img
        src={pfp_url}
        alt={username}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    ) : (
      <div
        className="rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0 text-xs"
        style={{ width: size, height: size }}
      >
        {username?.[0]?.toUpperCase() ?? "?"}
      </div>
    )
  );

  const Spinner = () => (
    <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );

  return (
    <div className="flex min-h-screen w-full bg-[#f4f4f4] overflow-hidden">
      <Sidebar />

      <main className="flex-1 min-w-0 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
        </header>

        <div className="max-w-xl">
          <h2 className="text-xl font-bold mb-5">Friends</h2>

          <div className="flex gap-0 mb-6 border border-black rounded overflow-hidden w-fit">
            {[
              { key: TAB_FRIENDS, label: "Friends" },
              { key: TAB_PENDING, label: `Pending${pending.length > 0 ? ` (${pending.length})` : ""}` },
              { key: TAB_ADD, label: "Add" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-5 py-2 text-sm font-semibold transition-colors cursor-pointer border-none ${
                  tab === key ? "bg-black text-white" : "bg-white text-black hover:bg-[#f0f0f0]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === TAB_FRIENDS && (
            <div>
              {loadingFriends ? (
                <div className="flex items-center gap-2 text-sm text-gray-500"><Spinner /> Loading...</div>
              ) : friends.length === 0 ? (
                <p className="text-sm text-gray-500">No friends yet. Add some from the Add tab.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {friends.map((f) => (
                    <div key={f.user_id} className="flex items-center justify-between bg-white border border-[#e0e0e0] rounded px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar username={f.username} pfp_url={f.pfp_url} />
                        <span className="font-semibold text-sm">{f.username}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => removeFriend(f.user_id)}
                          disabled={!!actionLoading[f.user_id]}
                          className="px-3 py-1.5 text-xs font-semibold border border-[#ccc] rounded hover:bg-[#f0f0f0] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {actionLoading[f.user_id] === "removing" ? <Spinner /> : null}
                          Remove
                        </button>
                        <button
                          onClick={() => blockUser(f.user_id)}
                          disabled={!!actionLoading[f.user_id]}
                          className="px-3 py-1.5 text-xs font-semibold border border-black rounded bg-black text-white hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {actionLoading[f.user_id] === "blocking" ? <Spinner /> : null}
                          Block
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === TAB_PENDING && (
            <div>
              {loadingPending ? (
                <div className="flex items-center gap-2 text-sm text-gray-500"><Spinner /> Loading...</div>
              ) : pending.length === 0 ? (
                <p className="text-sm text-gray-500">No pending requests.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {pending.map((p) => (
                    <div key={p.user_id} className="flex items-center justify-between bg-white border border-[#e0e0e0] rounded px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar username={p.username} pfp_url={p.pfp_url} />
                        <span className="font-semibold text-sm">{p.username}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptRequest(p.user_id)}
                          disabled={!!actionLoading[p.user_id]}
                          className="px-3 py-1.5 text-xs font-semibold bg-black text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {actionLoading[p.user_id] === "accepting" ? <Spinner /> : null}
                          Accept
                        </button>
                        <button
                          onClick={() => declineRequest(p.user_id)}
                          disabled={!!actionLoading[p.user_id]}
                          className="px-3 py-1.5 text-xs font-semibold border border-[#ccc] rounded hover:bg-[#f0f0f0] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {actionLoading[p.user_id] === "declining" ? <Spinner /> : null}
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === TAB_ADD && (
            <div>
              <input
                type="text"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2.5 border border-[#ccc] rounded focus:outline-none focus:border-black bg-white text-sm mb-4"
              />
              {loadingUsers ? (
                <div className="flex items-center gap-2 text-sm text-gray-500"><Spinner /> Loading users...</div>
              ) : searchQuery.trim() === "" ? (
                <p className="text-sm text-gray-500">Start typing to search for users.</p>
              ) : searchResults.length === 0 ? (
                <p className="text-sm text-gray-500">No users found.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {searchResults.map((u) => {
                    const isFriend = friends.some((f) => f.user_id === u.id);
                    return (
                      <div key={u.id} className="flex items-center justify-between bg-white border border-[#e0e0e0] rounded px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar username={u.username} pfp_url={u.pfp_url} />
                          <span className="font-semibold text-sm">{u.username}</span>
                        </div>
                        {isFriend ? (
                          <span className="text-xs text-gray-400 font-medium">Already friends</span>
                        ) : (
                          <button
                            onClick={() => sendRequest(u.id)}
                            disabled={!!actionLoading[u.id]}
                            className="px-3 py-1.5 text-xs font-semibold bg-black text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {actionLoading[u.id] === "adding" ? <Spinner /> : null}
                            Add Friend
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded shadow-lg text-sm font-semibold z-50 transition-all ${
          toast.type === "error" ? "bg-red-600 text-white" : "bg-black text-white"
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default Dashboard;