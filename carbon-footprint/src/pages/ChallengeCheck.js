import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./../sub_css/CommunityCheck.css";
import { Link } from "react-router-dom"; 

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>커뮤니티</h2>
      <ul>
        <li><Link to="/community">커뮤니티</Link></li>
        <li><Link to="/challenge" style={{ color: "#4CAF50" }}>챌린지</Link></li>
      </ul>
    </div>
  );
};

const ChallengeDetailPage = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅
  const { id } = useParams(); // URL 파라미터에서 글 ID를 가져옴
  const [challenge, setChallenge] = useState(null); // 챌린지 데이터를 저장할 상태
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지 상태

  useEffect(() => {
    // 챌린지 데이터를 가져오는 함수
    const fetchChallenge = async () => {
      try {
        const response = await fetch(`http://localhost:5000/challenges/${id}`);
        if (!response.ok) {
          throw new Error("챌린지 글 조회 실패");
        }
        const data = await response.json();
        setChallenge(data);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    fetchChallenge();
  }, [id]);

  // 삭제 버튼 클릭 핸들러
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/challenges/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("챌린지 글 삭제 실패");
      }
      alert("챌린지 글이 삭제되었습니다."); // 알림 표시
      navigate("/challenge"); // 챌린지 페이지로 이동
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  if (errorMessage) {
    return <div>{errorMessage}</div>;
  }

  if (!challenge) {
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
                <td id="headline">{challenge.title}</td>
              </tr>
              <tr>
                <td id="author">{challenge.author}</td>
                <td id="views">
                  <span>조회수</span>
                  <span id="views_number"> 0</span>
                </td>
                <div className="clear"></div>
              </tr>
              <tr>
                <td id="text">{challenge.detail}</td>
              </tr>
              <tr>
                <td id="file_download">
                  image1.jpg
                </td>
              </tr>
              <tr></tr>
            </tbody>
          </table>
          <div id="views_buttons">
            <Link to="/challenge" style={{ color: "black" } }><button className="catalog">
            목록</button></Link>
            <button className="catalog" onClick={handleDelete}>삭제</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeDetailPage;
