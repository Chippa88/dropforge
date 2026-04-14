import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CommunityPost, CommunityComment, ChatMessage } from "@/api/entities";
import { User } from "@/api/entities";

const POST_TYPES = [
  { key: "post",     label: "💬 Discussion", color: "#718096" },
  { key: "trend",    label: "📈 Trend Find",  color: "#38bdf8" },
  { key: "win",      label: "🏆 Win",         color: "#4ade80" },
  { key: "question", label: "❓ Question",    color: "#fbbf24" },
];

function getInitials(name, email) {
  if (name && name.trim()) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  return (email || "?").slice(0, 2).toUpperCase();
}

function Avatar({ name, email, size = 36 }) {
  const initials = getInitials(name, email);
  const colors = ["#6c63ff", "#38bdf8", "#4ade80", "#f59e0b", "#f87171", "#a78bfa"];
  const idx = (name || email || "").charCodeAt(0) % colors.length;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: colors[idx], display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0, letterSpacing: "-0.5px" }}>
      {initials}
    </div>
  );
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ─── SIDEBAR ─────────────────────────────────────────────────
// Routes use /Dropforge prefix to match App Builder page naming convention
function Sidebar({ navigate, active }) {
  const items = [
    { icon: "⬛", label: "Dashboard",     path: "/DropforgeDashboard"  },
    { icon: "🔍", label: "Find Products", path: "/DropforgeResearch"   },
    { icon: "✅", label: "Queue",          path: "/DropforgeQueue"      },
    { icon: "📊", label: "Analytics",     path: "/DropforgeAnalytics"  },
    { icon: "🌐", label: "Community",     path: "/DropforgeCommunity"  },
    { icon: "📧", label: "Digest Logs",   path: "/DropforgeDigestLogs" },
    { icon: "⚙️", label: "Settings",      path: "/DropforgeSettings"   },
  ];
  return (
    <aside style={{ width: 220, background: "#0d0e13", borderRight: "1px solid #1e2030", padding: "24px 0", display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 50 }}>
      <div style={{ padding: "0 24px 24px", borderBottom: "1px solid #1e2030", marginBottom: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>⚡ Drop<span style={{ color: "#6c63ff" }}>forge</span></div>
      </div>
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => navigate(item.path)}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 24px", background: item.path === active ? "#13151c" : "transparent", border: "none", color: item.path === active ? "#e2e8f0" : "#718096", cursor: "pointer", fontSize: 14, textAlign: "left", borderLeft: item.path === active ? "2px solid #6c63ff" : "2px solid transparent", transition: "all 0.15s" }}
        >
          <span>{item.icon}</span>{item.label}
        </button>
      ))}
    </aside>
  );
}

// ─── POST CARD ───────────────────────────────────────────────
function PostCard({ post, currentUser, onLike, onComment }) {
  const [expanded, setExpanded]       = useState(false);
  const [comments, setComments]       = useState([]);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting]         = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const liked    = Array.isArray(post.likes) && post.likes.includes(currentUser?.id);
  const typeInfo = POST_TYPES.find(t => t.key === post.type) || POST_TYPES[0];

  async function loadComments() {
    setLoadingComments(true);
    try {
      const c = await CommunityComment.filter({ post_id: post.id });
      setComments((c || []).sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
    } catch (e) { console.error(e); }
    finally { setLoadingComments(false); }
  }

  async function toggleExpand() {
    if (!expanded) await loadComments();
    setExpanded(!expanded);
  }

  async function submitComment() {
    if (!commentText.trim() || !currentUser) return;
    setPosting(true);
    try {
      const c = await CommunityComment.create({
        post_id:    post.id,
        user_id:    currentUser.id,
        user_name:  currentUser.full_name || currentUser.email,
        user_email: currentUser.email,
        content:    commentText.trim(),
        likes:      [],
      });
      setComments(prev => [...prev, c]);
      setCommentText("");
      onComment(post.id);
    } catch (e) { console.error(e); }
    finally { setPosting(false); }
  }

  return (
    <div style={{ background: "#13151c", border: "1px solid #1e2030", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
          <Avatar name={post.user_name} email={post.user_email} size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{post.user_name || post.user_email}</span>
              <span style={{ background: typeInfo.color + "22", color: typeInfo.color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>{typeInfo.label}</span>
              <span style={{ fontSize: 12, color: "#4a5568", marginLeft: "auto" }}>{timeAgo(post.created_date)}</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 15, color: "#e2e8f0", lineHeight: 1.65, marginBottom: 16, whiteSpace: "pre-wrap" }}>{post.content}</div>

        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {post.tags.map(t => (
              <span key={t} style={{ background: "#1e2030", color: "#6c63ff", padding: "2px 10px", borderRadius: 20, fontSize: 11 }}>#{t}</span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 20, alignItems: "center", paddingTop: 12, borderTop: "1px solid #1a1c26" }}>
          <button onClick={() => onLike(post.id, liked)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: liked ? "#6c63ff" : "#4a5568", fontSize: 13, fontWeight: liked ? 700 : 400, padding: 0 }}>
            <span style={{ fontSize: 16 }}>{liked ? "💜" : "🤍"}</span>
            {(post.likes?.length || 0)} {(post.likes?.length || 0) === 1 ? "like" : "likes"}
          </button>
          <button onClick={toggleExpand} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: expanded ? "#6c63ff" : "#4a5568", fontSize: 13, padding: 0 }}>
            <span style={{ fontSize: 16 }}>💬</span>
            {post.comment_count || 0} {(post.comment_count || 0) === 1 ? "comment" : "comments"}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ background: "#0f1117", borderTop: "1px solid #1e2030", padding: "16px 24px" }}>
          {loadingComments ? (
            <div style={{ color: "#4a5568", fontSize: 13, padding: "8px 0" }}>Loading comments...</div>
          ) : comments.length === 0 ? (
            <div style={{ color: "#4a5568", fontSize: 13, padding: "8px 0" }}>No comments yet. Be first.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
              {comments.map(c => (
                <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Avatar name={c.user_name} email={c.user_email} size={28} />
                  <div style={{ flex: 1, background: "#13151c", borderRadius: 12, padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{c.user_name || c.user_email}</span>
                      <span style={{ fontSize: 11, color: "#4a5568" }}>{timeAgo(c.created_date)}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#a0aec0", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{c.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <Avatar name={currentUser?.full_name} email={currentUser?.email} size={30} />
            <div style={{ flex: 1 }}>
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
                placeholder="Write a comment... (Enter to post, Shift+Enter for new line)"
                rows={2}
                style={{ width: "100%", background: "#13151c", border: "1px solid #1e2030", borderRadius: 10, padding: "10px 14px", color: "#e2e8f0", fontSize: 13, outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>
            <button
              onClick={submitComment}
              disabled={!commentText.trim() || posting}
              style={{ background: "#6c63ff", border: "none", color: "#fff", padding: "10px 16px", borderRadius: 10, cursor: !commentText.trim() || posting ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, opacity: !commentText.trim() || posting ? 0.5 : 1 }}
            >
              {posting ? "..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────
export default function Community() {
  const navigate = useNavigate();
  const [tab, setTab]                 = useState("feed");
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts]             = useState([]);
  const [messages, setMessages]       = useState([]);
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType]       = useState("post");
  const [postTags, setPostTags]       = useState("");
  const [posting, setPosting]         = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [chatInput, setChatInput]     = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [filterType, setFilterType]   = useState("all");
  const chatBottomRef = useRef(null);
  const chatPollRef   = useRef(null);

  useEffect(() => {
    User.me?.().then(u => setCurrentUser(u)).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === "feed") loadPosts();
  }, [tab, filterType]);

  useEffect(() => {
    if (tab === "chat") {
      loadMessages();
      chatPollRef.current = setInterval(loadMessages, 4000);
    } else {
      clearInterval(chatPollRef.current);
    }
    return () => clearInterval(chatPollRef.current);
  }, [tab]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadPosts() {
    setLoadingPosts(true);
    try {
      const all    = await CommunityPost.list();
      const sorted = (all || []).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setPosts(filterType === "all" ? sorted : sorted.filter(p => p.type === filterType));
    } catch (e) { console.error(e); }
    finally { setLoadingPosts(false); }
  }

  async function loadMessages() {
    try {
      const msgs   = await ChatMessage.filter({ room: "general" });
      const sorted = (msgs || []).sort((a, b) => new Date(a.created_date) - new Date(b.created_date)).slice(-100);
      setMessages(sorted);
    } catch (e) { console.error(e); }
  }

  async function submitPost() {
    if (!postContent.trim() || !currentUser) return;
    setPosting(true);
    try {
      const tags = postTags.trim()
        ? postTags.split(",").map(t => t.trim().toLowerCase().replace(/\s+/g, "-").replace(/^#/, "")).filter(Boolean)
        : [];
      const p = await CommunityPost.create({
        user_id:       currentUser.id,
        user_name:     currentUser.full_name || currentUser.email,
        user_email:    currentUser.email,
        content:       postContent.trim(),
        type:          postType,
        likes:         [],
        comment_count: 0,
        tags,
      });
      setPosts(prev => [p, ...prev]);
      setPostContent("");
      setPostTags("");
    } catch (e) { console.error(e); }
    finally { setPosting(false); }
  }

  async function handleLike(postId, alreadyLiked) {
    if (!currentUser) return;
    const post  = posts.find(p => p.id === postId);
    if (!post) return;
    const likes = alreadyLiked
      ? (post.likes || []).filter(id => id !== currentUser.id)
      : [...(post.likes || []), currentUser.id];
    await CommunityPost.update(postId, { likes });
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes } : p));
  }

  async function handleCommentPosted(postId) {
    const post  = posts.find(p => p.id === postId);
    if (!post) return;
    const count = (post.comment_count || 0) + 1;
    await CommunityPost.update(postId, { comment_count: count });
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: count } : p));
  }

  async function sendChatMessage() {
    if (!chatInput.trim() || !currentUser || sendingChat) return;
    setSendingChat(true);
    const text = chatInput.trim();
    setChatInput("");
    try {
      await ChatMessage.create({
        user_id:    currentUser.id,
        user_name:  currentUser.full_name || currentUser.email,
        user_email: currentUser.email,
        content:    text,
        room:       "general",
      });
      await loadMessages();
    } catch (e) { console.error(e); }
    finally { setSendingChat(false); }
  }

  return (
    <div style={{ background: "#0A0B0F", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#fff", display: "flex" }}>
      <Sidebar navigate={navigate} active="/DropforgeCommunity" />

      <main style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column", maxHeight: "100vh", overflow: "hidden" }}>

        {/* TOP BAR */}
        <div style={{ padding: "28px 40px 0", borderBottom: "1px solid #1e2030", flexShrink: 0, background: "#0A0B0F" }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 4px" }}>🌐 Community</h1>
            <p style={{ margin: 0, color: "#4a5568", fontSize: 13 }}>Share wins, spot trends, ask questions — all Dropforge users, one room.</p>
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            {[{ key: "feed", label: "📋 Feed" }, { key: "chat", label: "💬 Live Chat" }].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{ padding: "10px 24px", background: "none", border: "none", borderBottom: tab === t.key ? "2px solid #6c63ff" : "2px solid transparent", color: tab === t.key ? "#e2e8f0" : "#4a5568", cursor: "pointer", fontSize: 14, fontWeight: tab === t.key ? 700 : 400, marginBottom: -1 }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── FEED TAB ── */}
        {tab === "feed" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28, maxWidth: 1060, margin: "0 auto" }}>

              {/* LEFT */}
              <div>
                {/* NEW POST */}
                {currentUser && (
                  <div style={{ background: "#13151c", border: "1px solid #1e2030", borderRadius: 16, padding: "20px 24px", marginBottom: 24 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                      <Avatar name={currentUser.full_name} email={currentUser.email} size={36} />
                      <textarea
                        value={postContent}
                        onChange={e => setPostContent(e.target.value)}
                        placeholder="Share a product win, spot a trend, ask the community..."
                        rows={3}
                        style={{ flex: 1, background: "#0f1117", border: "1px solid #1e2030", borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.6 }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      {POST_TYPES.map(t => (
                        <button key={t.key} onClick={() => setPostType(t.key)} style={{ background: postType === t.key ? t.color + "22" : "#0f1117", border: `1px solid ${postType === t.key ? t.color : "#1e2030"}`, color: postType === t.key ? t.color : "#4a5568", padding: "5px 12px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                          {t.label}
                        </button>
                      ))}
                      <input type="text" value={postTags} onChange={e => setPostTags(e.target.value)} placeholder="tags: fitness, pets" style={{ background: "#0f1117", border: "1px solid #1e2030", borderRadius: 8, padding: "6px 12px", color: "#718096", fontSize: 12, outline: "none", width: 160 }} />
                      <button onClick={submitPost} disabled={!postContent.trim() || posting} style={{ marginLeft: "auto", background: "#6c63ff", border: "none", color: "#fff", padding: "8px 20px", borderRadius: 10, cursor: !postContent.trim() || posting ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, opacity: !postContent.trim() || posting ? 0.5 : 1 }}>
                        {posting ? "Posting..." : "Post →"}
                      </button>
                    </div>
                  </div>
                )}

                {/* FILTERS */}
                <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
                  {[{ key: "all", label: "All" }, ...POST_TYPES.map(t => ({ key: t.key, label: t.label }))].map(f => (
                    <button key={f.key} onClick={() => setFilterType(f.key)} style={{ background: filterType === f.key ? "#1e2030" : "transparent", border: "1px solid #1e2030", color: filterType === f.key ? "#e2e8f0" : "#4a5568", padding: "5px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: filterType === f.key ? 600 : 400 }}>
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* POSTS */}
                {loadingPosts ? (
                  <div style={{ color: "#4a5568", textAlign: "center", padding: 60 }}>Loading feed...</div>
                ) : posts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "#4a5568" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
                    <div style={{ fontSize: 15, color: "#718096", marginBottom: 8 }}>Be the first to post in the community.</div>
                    <div style={{ fontSize: 13 }}>Share a trend, a win, or ask a question.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {posts.map(post => (
                      <PostCard key={post.id} post={post} currentUser={currentUser} onLike={handleLike} onComment={handleCommentPosted} />
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT WIDGETS */}
              <div>
                <div style={{ background: "#13151c", border: "1px solid #1e2030", borderRadius: 14, padding: "20px", marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>About</div>
                  <div style={{ fontSize: 13, color: "#718096", lineHeight: 1.7 }}>A private space for Dropforge users. Share wins, spot trends early, help each other build better stores. What you share here stays here.</div>
                </div>
                <div style={{ background: "#13151c", border: "1px solid #1e2030", borderRadius: 14, padding: "20px", marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Post Types</div>
                  {POST_TYPES.map(t => (
                    <div key={t.key} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <span style={{ background: t.color + "22", color: t.color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>{t.label}</span>
                      <span style={{ fontSize: 12, color: "#4a5568" }}>
                        {t.key === "post" && "Open discussion"}
                        {t.key === "trend" && "Trending product"}
                        {t.key === "win"   && "Success story"}
                        {t.key === "question" && "Ask the community"}
                      </span>
                    </div>
                  ))}
                </div>
                <div onClick={() => setTab("chat")} style={{ background: "#1e1d3a", border: "1px solid #6c63ff44", borderRadius: 14, padding: "20px", cursor: "pointer" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#6c63ff", marginBottom: 6 }}>💬 Live Chat →</div>
                  <div style={{ fontSize: 12, color: "#718096" }}>Jump into the real-time chatroom to talk trends with other users right now.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CHAT TAB ── */}
        {tab === "chat" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "12px 40px", background: "#0d0e13", borderBottom: "1px solid #1e2030", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
              <span style={{ fontSize: 13, color: "#718096" }}>General · Live · Refreshes every 4 seconds</span>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "24px 40px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#4a5568", padding: "60px 0" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
                  <div style={{ fontSize: 14, color: "#718096" }}>No messages yet. Start the conversation.</div>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe        = msg.user_id === currentUser?.id;
                  const showAvatar  = i === 0 || messages[i - 1].user_id !== msg.user_id;
                  return (
                    <div key={msg.id} style={{ display: "flex", gap: 10, alignItems: "flex-end", flexDirection: isMe ? "row-reverse" : "row" }}>
                      {!isMe && showAvatar
                        ? <Avatar name={msg.user_name} email={msg.user_email} size={30} />
                        : <div style={{ width: 30, flexShrink: 0 }} />
                      }
                      <div style={{ maxWidth: "60%" }}>
                        {showAvatar && !isMe && (
                          <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 3, paddingLeft: 2 }}>
                            {msg.user_name || msg.user_email} · {timeAgo(msg.created_date)}
                          </div>
                        )}
                        <div style={{ background: isMe ? "#6c63ff" : "#13151c", border: `1px solid ${isMe ? "#6c63ff" : "#1e2030"}`, borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "10px 14px", fontSize: 14, color: "#e2e8f0", lineHeight: 1.5, wordBreak: "break-word" }}>
                          {msg.content}
                        </div>
                        {isMe && <div style={{ fontSize: 11, color: "#4a5568", marginTop: 3, textAlign: "right", paddingRight: 2 }}>{timeAgo(msg.created_date)}</div>}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            <div style={{ padding: "16px 40px", borderTop: "1px solid #1e2030", background: "#0d0e13", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", maxWidth: 860, margin: "0 auto" }}>
                {currentUser && <Avatar name={currentUser.full_name} email={currentUser.email} size={34} />}
                <textarea
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                  placeholder="Message the community... (Enter to send)"
                  rows={1}
                  style={{ flex: 1, background: "#13151c", border: "1px solid #1e2030", borderRadius: 12, padding: "12px 16px", color: "#e2e8f0", fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || sendingChat || !currentUser}
                  style={{ background: "#6c63ff", border: "none", color: "#fff", width: 44, height: 44, borderRadius: 12, cursor: !chatInput.trim() || !currentUser ? "not-allowed" : "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", opacity: !chatInput.trim() || !currentUser ? 0.4 : 1, flexShrink: 0 }}
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
