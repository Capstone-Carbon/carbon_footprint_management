import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './../sub_css/MyPage.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>MY PAGE</h2>
      <ul>
        <li>
          <Link to="/mypage" style={{ color: '#4CAF50' }}>
            MY 등급
          </Link>
        </li>
      </ul>
    </div>
  );
};

const MyPage = () => {
  const maxStamps = 30;
  const [totalStampCount, setTotalStampCount] = useState(0);
  const [visualStampCount, setVisualStampCount] = useState(0);
  const [level, setLevel] = useState('BRONZE');
  const [accountInputVisible, setAccountInputVisible] = useState(false);
  const [bankAccount, setBankAccount] = useState('');

  const fetchStampCount = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const response = await fetch(
        `http://localhost:8001/certifications/count?user_id=${userId}`
      );
      const data = await response.json();

      setTotalStampCount(data.count);
      setVisualStampCount(data.count % 30);

      const cycle = Math.floor(data.count / 30);
      if (cycle >= 3) {
        setLevel('GOLD');
      } else if (cycle >= 2) {
        setLevel('SILVER');
      } else {
        setLevel('BRONZE');
      }
    } catch (error) {
      console.error('스탬프 개수 가져오기 실패:', error);
    }
  };

  useEffect(() => {
    fetchStampCount();
  }, []);

  const handleSubmitAccount = () => {
    alert('계좌 정보가 저장되었습니다.');
    fetchStampCount(); // 등급과 스탬프 갱신
  };

  const progress = Math.round((visualStampCount / maxStamps) * 100);

  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <h2>마이 등급</h2>
        <div className="level-section">
          <p>
            현재 등급: <strong>{level}</strong>
          </p>
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <p>진행률: {progress}%</p>
        </div>

        <h2>스탬프</h2>
        <div className="stamp-section">
          <div className="stamp-container">
            {Array.from({ length: maxStamps }).map((_, index) => (
              <div
                key={index}
                className={`stamp ${index < visualStampCount ? 'filled' : ''}`}
              >
                {index + 1}
              </div>
            ))}
          </div>

          {/* 30개 채웠을 때만 보상 메시지 */}
          {totalStampCount > 0 && totalStampCount % 30 === 0 && (
            <div className="reward-message">
              <p style={{ color: 'green' }}>
                🎉 스탬프 30개를 모두 채우셨습니다!
              </p>
              <p>관리자에게 현금 1,000원이 지급될 예정입니다.</p>

              {!accountInputVisible ? (
                <button onClick={() => setAccountInputVisible(true)}>
                  계좌 정보 입력
                </button>
              ) : (
                <div>
                  <input
                    type="text"
                    placeholder="예: 국민은행 123456-78-901234"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                  />
                  <button onClick={handleSubmitAccount}>저장</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
