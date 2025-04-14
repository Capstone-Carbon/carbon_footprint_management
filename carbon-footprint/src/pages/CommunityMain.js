import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './../sub_css/Community.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>커뮤니티</h2>
      <ul>
        <li>
          <Link to="/community" id="side_community" style={{ color: '#4CAF50' }}>
            커뮤니티
          </Link>
        </li>
      </ul>
    </div>
  );
};

const CommunityPage = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const currentPosts = posts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('❌ 게시글 조회 실패:', error);
      }
    };

    const fetchRankings = async () => {
      try {
        const response = await fetch('http://localhost:5000/posts/top');
        const data = await response.json();
        console.log('🔥 랭킹 데이터:', data);
        setRankings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('❌ 랭킹 조회 실패:', error);
        setRankings([]);
      }
    };

    fetchPosts();
    fetchRankings();
  }, []);

  const handleJoinClick = () => {
    navigate('/CommunityWrite');
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="community_container">
      <Sidebar />
      <div className="main-content">
        <h2>커뮤니티</h2>

        {/* RANK 섹션 */}
        <div className="ranking-section">
          <h3>RANK</h3>
          <table>
            <thead>
              <tr className="ranking-tr">
                <th>순위</th>
                <th>글 제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>조회수</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((item, index) => (
                <tr className="ranking-tr" key={item.id}>
                  <td className="ranking-th">{index + 1}</td>
                  <td className="ranking-th">
                    <Link to={`/communityCheck/${item.id}`} style={{ color: 'black' }}>
                      {item.title}
                    </Link>
                  </td>
                  <td className="ranking-th">{item.author}</td>
                  <td className="ranking-th">{formatDate(item.created_at)}</td>
                  <td className="ranking-th">{item.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 게시판 섹션 */}
        <div className="board-section">
          <h3>게시판</h3>
          <table>
            <thead>
              <tr className="board-tr">
                <th className="ranking-th">번호</th>
                <th className="ranking-th">글</th>
                <th className="ranking-th">작성자</th>
                <th className="ranking-th">작성일</th>
                <th className="ranking-th">조회수</th>
              </tr>
            </thead>
            <tbody>
              {currentPosts.map((post) => (
                <tr className="board-tr" key={post.id}>
                  <td className="board-th">{post.id}</td>
                  <td className="board-th">
                    <Link to={`/communityCheck/${post.id}`} style={{ color: 'black' }}>
                      {post.title}
                    </Link>
                  </td>
                  <td className="board-th">{post.author}</td>
                  <td className="board-th">{formatDate(post.created_at)}</td>
                  <td className="board-th">{post.views}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 페이지 네비게이션 */}
          <div className="community-number">
            <button className="number" onClick={() => handlePageChange(currentPage - 1)}>
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className="number"
                onClick={() => handlePageChange(i + 1)}
                style={{
                  fontWeight: currentPage === i + 1 ? 'bold' : 'normal',
                }}
              >
                {i + 1}
              </button>
            ))}
            <button className="number" onClick={() => handlePageChange(currentPage + 1)}>
              &gt;
            </button>
          </div>

          {/* 글쓰기 버튼 */}
          <div className="post">
            <button type="button" className="write" onClick={handleJoinClick}>
              글쓰기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;