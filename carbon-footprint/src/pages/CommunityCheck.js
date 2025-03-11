import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../sub_css/CommunityCheck.css";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>커뮤니티</h2>
      <ul>
        <li><Link to="/community" style={{ color: "#4CAF50" }}>커뮤니티</Link></li>
        <li><Link to="/challenge">챌린지</Link></li>
      </ul>
    </div>
  );
};

const CommunityDetailPage = () => {
    const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅
  
    // 삭제 버튼 클릭 핸들러
    const handleDelete = () => {
      alert("게시글이 삭제되었습니다."); // 알림 표시
      navigate("/community"); // 커뮤니티 페이지로 이동
    };
  
    return (
      <div className="community_container">
        <Sidebar />
        <div className="main-content">
          <h2>게시글 조회</h2>
  

      {/* 글 제목, 작성자, views_number 숫자, 본문/내용을 
                서버와 연결해서 ChallengeWrtie에서 가져와야함*/}
          <form>
            <table id="detailTable">
              <tbody>
                <tr>
                  <td id="headline">글 제목</td>
                </tr>
                <tr>
                  <td id="author">작성자</td>
                  <td id="views">
                    <span>조회수</span>
                    <span>&nbsp; 0</span>
                  </td>
                  <div className="clear"></div>
                </tr>
                <tr>
                  <td id="text">
                    본문/내용
                  </td>
                </tr>
                
                <tr></tr>
              </tbody>
            </table>
            <div id="views_buttons">
                <Link to="/community" style={{ color: "black" } }><button className="catalog">
                목록</button></Link>
              <button className="catalog" onClick={handleDelete}>삭제</button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  

export default CommunityDetailPage;
