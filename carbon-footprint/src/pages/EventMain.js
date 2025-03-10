import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./../sub_css/Event.css"; // 스타일 파일 연결

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>이벤트</h2>
      <ul>
        <li><Link to="/event" style={{ color: "#4CAF50" }}>이벤트 응모</Link></li>
      </ul>
    </div>
  );
};


const EventPage = () => {
  const [receipt, setReceipt] = useState(null);
  const [preview, setPreview] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    // 스탬프 개수를 LocalStorage에서 불러오기
    const storedStamps = localStorage.getItem("stampCount");
    if (!storedStamps) {
      localStorage.setItem("stampCount", "0");
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceipt(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!receipt) {
      setFeedback("⚠️ 영수증을 업로드해주세요.");
      return;
    }

    // ✅ 기존 스탬프 개수를 가져와서 1 증가
    let currentStamp = parseInt(localStorage.getItem("stampCount") || "0", 10);
    localStorage.setItem("stampCount", (currentStamp + 1).toString());

    setFeedback("✅ 응모가 완료되었습니다! 스탬프 +1 적립 🎉");
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <h2>제품 응모 페이지</h2>
        <div className="eventComponent">
          <div className="event-guide">
            <h2>📢 이벤트 응모 안내</h2>
            <p>
              저탄소 인증 제품을 구매하고 스탬프를 적립하세요! 응모 방법은 다음과 같습니다.
            </p>

            <h3>📌 응모 방법</h3>
            <p>1️⃣ <strong>제품 선택: </strong> 응모할 저탄소 제품을 선택하세요.</p>
            <p>2️⃣ <strong>영수증 업로드: </strong> 파일 선택 후 영수증을 업로드하세요.</p>
            <p>3️⃣ <strong>응모하기 버튼 클릭: </strong> 정상 등록되면 스탬프가 적립됩니다.</p>

            <h3>🎁 이벤트 혜택</h3>
            <p>✔ 스탬프를 모으면 등급이 상승하고 추가 혜택이 주어집니다.</p>
            <p>✔ 할인 쿠폰은 ‘내 쿠폰’ 페이지에서 확인할 수 있습니다.</p>
          </div>

          <form onSubmit={handleSubmit} id="applyForm">
            <h2 id="receiptLabel">인증</h2>
            
            {/* 파일 업로드 */}
            <input type="file" id="applyFile" accept="image/*" onChange={handleFileChange} />

            {/* 이미지 미리보기 */}
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="영수증 미리보기" style={{ width: "150px", marginTop: "10px" }} />
              </div>
            )}

            <button type="submit" id="applybtn">응모하기</button>

            {feedback && <p className="feedback-message">{feedback}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventPage;
