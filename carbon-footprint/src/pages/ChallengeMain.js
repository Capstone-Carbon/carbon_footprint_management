import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Link 추가
import "./../sub_css/Community.css"; // 스타일 분리

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>커뮤니티</h2>
      <ul>
        <li><Link to="/community">커뮤니티</Link></li>
        <li><Link to="/challenge" style={{ color: "#4CAF50" }}>챌린지</Link></li> {/* Link 수정됨 */}
      </ul>
    </div>
  );
};

const CommunityPage = () => {
  const navigate = useNavigate();
  // 랭킹 데이터 (예제) ==> 예제니깐 서버랑 연동해서 sql title, user 가져와서 수정해야함
  const rankings = [
    { rank: 1, title: "탄소배출량 줄이는 방법 추천!", user: "⭕⭕⭕" },
    { rank: 2, title: "가정 속 탄소 줄이기!", user: "ㄱㄴㄷ" },
  ];

  // 게시판 글 데이터
  const [posts, setPosts] = useState([]);

  // 서버에서 게시글 데이터 가져오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/challenges', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  const handleJoinClick = () => {
    navigate("/challengeWrite");
  };

  return (
    <div className="community_container">
      <Sidebar />
      <div className="main-content">
        <h2>챌린지</h2>

        {/* 랭킹 섹션 */}
        <div className="ranking-section">
          <h3>RANK</h3>
          <table>
            <thead>
              <tr className="ranking-tr">
                <th>순위</th>
                <th>글 제목</th>
                <th>작성자</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((item) => (
                <tr className="ranking-tr" key={item.rank}>
                  <td className="ranking-th">{item.rank}</td>
                  <td className="ranking-th"><Link to="/challengeCheck" style={{color:"black"}}>{item.title}</Link></td>
                  <td className="ranking-th">{item.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 챌린지 섹션 */}
        <div className="board-section">
          <h3>챌린지</h3>
          <table>
            <thead>
              <tr className="board-tr">
                <th className="ranking-th">목록</th>
                <th className="ranking-th">글</th>
                <th className="ranking-th">작성자</th>
              </tr>
            </thead>

            <tbody>
              {posts.map((post) => (
                <tr className="board-tr" key={post.id}>
                  <td className="board-th">{post.id}</td>
                  <td className="board-th">{post.title}</td>
                  <td className="board-th">{post.author}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="community-number">
              <button className="number">&lt;</button>
              <button className="number">1</button>
              <button className="number">2</button>
              <button className="number">3</button>
              <button className="number">&gt;</button>
          </div>

          <div className="post">
            <button type="button" className="write" onClick={handleJoinClick}>글쓰기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
