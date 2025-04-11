// ✅ CommunityCheck.js - 댓글 수정 textarea 크기 축소
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { UserContext } from '../UserContext';
import './../sub_css/CommunityCheck.css';

const Sidebar = () => (
  <div className="sidebar">
    <h2>커뮤니티</h2>
    <ul>
      <li>
        <Link to="/community" style={{ color: '#4CAF50' }}>
          커뮤니티
        </Link>
      </li>
    </ul>
  </div>
);

const CommunityDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { username } = useContext(UserContext);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [replyBoxId, setReplyBoxId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [collapsedReplies, setCollapsedReplies] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      await fetch(`http://localhost:5000/posts/${id}/views`, {
        method: 'POST',
        credentials: 'include',
      });
      const resPost = await fetch(`http://localhost:5000/posts/${id}`, {
        credentials: 'include',
      });
      const dataPost = await resPost.json();
      setPost(dataPost);
      await loadComments();
    };
    fetchData();
  }, [id]);

  const loadComments = async () => {
    const res = await fetch(`http://localhost:5000/posts/${id}/comments`, {
      credentials: 'include',
    });
    const data = await res.json();
    setComments(data);
  };

  const handleDelete = async () => {
    const response = await fetch(`http://localhost:5000/posts/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (response.ok) {
      alert('게시글이 삭제되었습니다.');
      navigate('/community');
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    await fetch(`http://localhost:5000/posts/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ author: username || '익명', text: commentText }),
    });
    await loadComments();
    setCommentText('');
  };

  const handleReplySubmit = async (parentId) => {
    if (!replyText.trim()) return;
    await fetch(`http://localhost:5000/posts/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        author: username || '익명',
        text: replyText,
        parent_id: parentId,
      }),
    });
    await loadComments();
    setReplyText('');
    setReplyBoxId(null);
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    await fetch(`http://localhost:5000/comments/${commentId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    await loadComments();
  };

  const handleCommentUpdate = async (commentId) => {
    await fetch(`http://localhost:5000/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text: editedText }),
    });
    await loadComments();
    setEditingCommentId(null);
  };

  const toggleReplyBox = (id) => {
    setReplyBoxId((prev) => (prev === id ? null : id));
  };

  const toggleCollapse = (id) => {
    setCollapsedReplies((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const buildCommentTree = (comments) => {
    const map = {};
    comments.forEach((c) => (map[c.id] = { ...c, children: [] }));
    const tree = [];
    comments.forEach((c) => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].children.push(map[c.id]);
        map[c.parent_id].children.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      } else {
        tree.push(map[c.id]);
      }
    });
    tree.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return tree;
  };

  const renderComments = (list) =>
    list.map((c) => (
      <li
        key={c.id}
        className={c.parent_id ? 'reply' : ''}
        style={{ marginLeft: c.parent_id ? 40 : 0 }}
      >
        <div className="comment-author">{c.author}</div>
        <div className="comment-content">{c.text}</div>
        <div className="comment-meta">
          <span>{c.created_at.slice(0, 10)}</span>
          <span onClick={() => toggleReplyBox(c.id)}>답글쓰기</span>
          {username === c.author && (
            <>
              <span
                onClick={() => {
                  setEditingCommentId(c.id);
                  setEditedText(c.text);
                }}
              >
                수정
              </span>
              <span onClick={() => handleCommentDelete(c.id)}>삭제</span>
            </>
          )}
        </div>

        {editingCommentId === c.id ? (
          <>
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              style={{ width: '100%', height: '60px' }}
            />
            <div>
              <button onClick={() => handleCommentUpdate(c.id)}>저장</button>
              <button onClick={() => setEditingCommentId(null)}>취소</button>
            </div>
          </>
        ) : (
          replyBoxId === c.id && (
            <div className="reply-box">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="답글을 입력하세요"
              />
              <button onClick={() => handleReplySubmit(c.id)}>작성</button>
            </div>
          )
        )}

        {!collapsedReplies[c.id] && c.children.length > 0 && (
          <>{renderComments(c.children)}</>
        )}
      </li>
    ));

  if (!post) return <div>Loading...</div>;
  const formattedDate = new Date(post.created_at).toLocaleDateString();

  return (
    <div className="community_container">
      <Sidebar />
      <div className="main-content">
        <h2 className="view-title">게시글 조회</h2>
        <div className="post-card">
          <div id="headline">{post.title}</div>
          <div className="meta-info">작성자: {post.author}</div>
          <div className="meta-subinfo">
            작성일: {formattedDate} &nbsp;|&nbsp; 조회수: {post.views}
          </div>
          <div id="text">{post.detail}</div>
          <div id="views_buttons">
            <Link to="/community">
              <button className="catalog" type="button">
                목록
              </button>
            </Link>
            <button className="catalog" type="button" onClick={handleDelete}>
              삭제
            </button>
          </div>
        </div>

        <div className="comment-section">
          <h4>댓글</h4>
          <div className="comment-input">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요"
              style={{ height: '60px', width: '100%' }}
            />
            <button onClick={handleCommentSubmit}>작성</button>
          </div>
          <ul className="comment-list">
            {renderComments(buildCommentTree(comments))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetailPage;
