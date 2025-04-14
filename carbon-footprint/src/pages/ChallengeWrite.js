import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../sub_css/CommunityWrite.css"; // 스타일 분리
import { Link } from "react-router-dom"; // ✅ 추가해야 함

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

const ChallengeWritePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", detail: "" });
  const [image, setImage] = useState(null); // ✅ 이미지 저장 state 추가

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // ✅ 이미지 미리보기 설정
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("챌린지 글이 성공적으로 등록되었습니다!");
        navigate("/challenge");
      } else {
        const data = await response.json();
        alert(data.message || "챌린지 글 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error('Error:', error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="community_container">
      <Sidebar />
      <div className="main-content">
        <h2>챌린지 글쓰기</h2>

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

              {/* ✅ 사진 업로드 추가 */}
              <tr>
                <td className="header">Upload Image</td>
              </tr>
              <tr>
                <td>
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                  {image && (
                    <div className="image-preview">
                      <img src={image} alt="Preview" style={{ width: "350px", marginTop: "10px" }} />
                    </div>
                  )}
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

export default ChallengeWritePage;
