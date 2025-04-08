import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './../sub_css/CommunityCheck.css';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
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
};

const CommunityDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:5000/posts/${id}`);
        if (!response.ok) {
          throw new Error('글 조회 실패');
        }
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
      if (!response.ok) {
        throw new Error('글 삭제 실패');
      }

      alert('게시글이 삭제되었습니다.');
      navigate('/community');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  if (errorMessage) {
    return <div>{errorMessage}</div>;
  }

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="community_container">
      <Sidebar />
      <div className="main-content">
        <h2>게시글 조회</h2>

        <form>
          <table id="detailTable">
            <tbody>
              <tr>
                <td id="headline">{post.title}</td>
              </tr>
              <tr>
                <td id="author">{post.author}</td>
                <td id="views">
                  <span>조회수</span>
                  <span id="views_number"> 0</span>
                </td>
                <div className="clear"></div>
              </tr>
              <tr>
                <td id="text">{post.detail}</td>
              </tr>
              <tr></tr>
            </tbody>
          </table>
          <div id="views_buttons">
            <Link to="/community" style={{ color: 'black' }}>
              <button className="catalog">목록</button>
            </Link>
            <button
              className="catalog"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              삭제
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityDetailPage;
