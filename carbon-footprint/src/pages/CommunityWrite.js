import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../sub_css/CommunityWrite.css"; // 스타일 분리
import { Link } from "react-router-dom"; // ✅ 추가해야 함

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>커뮤니티</h2>
      <ul>
        <li><Link to="/community" style={{ color: "#4CAF50" }}>커뮤니티</Link></li>
        <li><Link to="/challenge">챌린지</Link></li> {/* Link 수정됨 */}
      </ul>
    </div>
  );
};

const CommunityWritePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", detail: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // 기본 폼 제출 방지
    alert("작성 완료!");
    navigate("/community"); // 글 작성 후 커뮤니티 페이지로 이동
  };

  return (
    <div className="community_container">
      <Sidebar />
      <div className="main-content">
        <h2>게시판 글쓰기</h2>

        <form onSubmit={handleSubmit}>
          <table>
            <tbody>
              <tr>
                <td className="header">Title</td>
              </tr>
              <tr>
                <td>
                  <input
                    className="component_write"
                    type="text"
                    placeholder="제목을 입력하세요"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </td>
              </tr>
              <tr>
                <td className="header">Comment</td>
              </tr>
              <tr>
                <td>
                  <textarea
                    placeholder="내용을 입력하세요"
                    name="detail"
                    value={formData.detail}
                    onChange={handleChange}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <button className="register" type="submit">등록</button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </div>
    
  );
};

export default CommunityWritePage;
