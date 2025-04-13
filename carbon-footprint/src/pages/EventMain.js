import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./../sub_css/Event.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>이벤트</h2>
      <ul>
        <li>
          <Link to="/event" style={{ color: "#4CAF50" }}>이벤트 응모</Link>
        </li>
      </ul>
    </div>
  );
};

const EventPage = () => {
  const [markImage, setMarkImage] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);
  const [markPreview, setMarkPreview] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const storedStamps = localStorage.getItem("stampCount");
    if (!storedStamps) localStorage.setItem("stampCount", "0");
  }, []);

  const handleMarkChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMarkImage(file);
      setMarkPreview(URL.createObjectURL(file));
    }
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptImage(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!markImage || !receiptImage) {
      setFeedback("⚠️ 마크 이미지와 영수증 이미지를 모두 업로드해주세요.");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setFeedback("⚠️ 로그인 정보가 없습니다. 먼저 로그인 해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("mark_img", markImage);      // ✅ 여기를 백엔드와 일치
    formData.append("receipt_img", receiptImage); // ✅ 여기도 백엔드와 일치

    try {
      const response = await fetch("http://localhost:8000/verify_receipt?user_id=" + userId, {
        method: "POST",
        body: formData
      });      

      const result = await response.json();

      if (result.valid) {
        let currentStamp = parseInt(localStorage.getItem("stampCount") || "0", 10);
        localStorage.setItem("stampCount", (currentStamp + 1).toString());
        setFeedback("✅ 인증 성공! 스탬프 +1 🎉");
      } else {
        setFeedback("❌ 인증 실패. 올바른 마크와 영수증을 업로드해주세요.");
      }
    } catch (error) {
      console.error("서버 오류:", error);
      setFeedback("🚨 서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <h2>제품 응모 페이지</h2>
        <div className="eventComponent">
          <div className="event-guide">
            <h2>📢 이벤트 응모 안내</h2>
            <p>저탄소 인증 제품을 구매하고 스탬프를 적립하세요!</p>

            <h3>📌 응모 방법</h3>
            <p>1️⃣ 저탄소 마크 이미지와 영수증을 각각 업로드</p>
            <p>2️⃣ 응모하기 클릭 시 인증 성공 시 스탬프 적립</p>

            <h3>🎁 이벤트 혜택</h3>
            <p>✔ 등급이 상승하면 할인 쿠폰 등 혜택이 주어집니다.</p>
          </div>

          <form onSubmit={handleSubmit} id="applyForm">
            <h2>📤 이미지 업로드</h2>

            <label>저탄소 마크 이미지</label>
            <input type="file" accept="image/*" onChange={handleMarkChange} />
            {markPreview && <img src={markPreview} alt="마크 미리보기" width="150" />}

            <br />

            <label>영수증 이미지</label>
            <input type="file" accept="image/*" onChange={handleReceiptChange} />
            {receiptPreview && <img src={receiptPreview} alt="영수증 미리보기" width="150" />}

            <button type="submit" id="applybtn">응모하기</button>
            {feedback && <p className="feedback-message">{feedback}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventPage;
