import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
  const [post, setPost] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        await fetch(`http://localhost:5000/posts/${id}/views`, {
          method: 'POST',
        });
        const response = await fetch(`http://localhost:5000/posts/${id}`);
        if (!response.ok) throw new Error('글 조회 실패');
        const data = await response.json();
        setPost(data);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/posts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('글 삭제 실패');
      alert('게시글이 삭제되었습니다.');
      navigate('/community');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  if (errorMessage) return <div>{errorMessage}</div>;
  if (!post) return <div>Loading...</div>;

  const formattedDate = new Date(post.created_at).toLocaleDateString();

  return (
    <div className="community_container">
      <Sidebar />
      <div className="main-content">
        <h2 className="view-title">게시글 조회</h2>

        <div className="post-card">
          <div id="headline">{post.title}</div>

          {/* ✅ 작성자 (진하게) */}
          <div className="meta-info">작성자: {post.author}</div>

          {/* ✅ 작성일 + 조회수 (연한 회색) */}
          <div className="meta-subinfo">
            작성일: {formattedDate} &nbsp;|&nbsp; 조회수: {post.views}
          </div>

          {/* ✅ 본문 */}
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
      </div>
    </div>
  );
};

export default CommunityDetailPage;
