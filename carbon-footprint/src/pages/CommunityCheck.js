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
  const [errorMessage, setErrorMessage] = useState('');
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
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
      } catch (error) {
        setErrorMessage(error.message);
      }
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
    try {
      const response = await fetch(`http://localhost:5000/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('글 삭제 실패');
      alert('게시글이 삭제되었습니다.');
      navigate('/community');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:5000/posts/${id}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            author: username || '익명',
            text: commentText,
          }),
        }
      );

      if (response.ok) {
        await loadComments();
        setCommentText('');
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  const handleCommentDelete = async (commentId) => {
    const confirm = window.confirm('댓글을 삭제하시겠습니까?');
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:5000/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        await loadComments();
      } else {
        alert('댓글 삭제 실패');
      }
    } catch (err) {
      console.error('댓글 삭제 중 오류:', err);
    }
  };

  const handleCommentUpdate = async (commentId) => {
    try {
      const res = await fetch(`http://localhost:5000/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: editedText }),
      });

      if (res.ok) {
        await loadComments();
        setEditingCommentId(null);
      } else {
        alert('댓글 수정 실패');
      }
    } catch (err) {
      console.error('댓글 수정 중 오류:', err);
    }
  };

  const formattedDate = post
    ? new Date(post.created_at).toLocaleDateString()
    : '';

  if (errorMessage) return <div>{errorMessage}</div>;
  if (!post) return <div>Loading...</div>;

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

        {/* ✅ 댓글 섹션 */}
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
            {comments.map((c) => (
              <li key={c.id}>
                <strong>{c.author}</strong> ({c.created_at.slice(0, 10)})
                {editingCommentId === c.id ? (
                  <>
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      style={{
                        height: '60px',
                        width: '100%',
                        marginTop: '8px',
                      }}
                    />
                    <div className="comment-actions">
                      <button onClick={() => handleCommentUpdate(c.id)}>
                        저장
                      </button>
                      <button onClick={() => setEditingCommentId(null)}>
                        취소
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>{c.text}</p>
                    {username === c.author && (
                      <div className="comment-actions">
                        <button
                          onClick={() => {
                            setEditingCommentId(c.id);
                            setEditedText(c.text);
                          }}
                        >
                          수정
                        </button>
                        <button onClick={() => handleCommentDelete(c.id)}>
                          삭제
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetailPage;
