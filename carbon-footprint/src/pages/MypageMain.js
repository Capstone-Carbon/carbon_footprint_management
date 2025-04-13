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
  const maxStamps = 10;

  const getStoredValue = (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return localStorage.getItem(key) || defaultValue;
    }
  };

  const [stampCount, setStampCount] = useState(getStoredValue('stampCount', 0));
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState('BRONZE');

  // 🔁 stampCount 바뀔 때 등급/진행률 자동 계산
  useEffect(() => {
    const percentage = Math.min((stampCount / maxStamps) * 100, 100);
    setProgress(Math.round(percentage));

    if (stampCount >= 8) {
      setLevel('GOLD');
    } else if (stampCount >= 5) {
      setLevel('SILVER');
    } else {
      setLevel('BRONZE');
    }
  }, [stampCount]);

  // 🔒 저장
  useEffect(() => {
    localStorage.setItem('stampCount', JSON.stringify(stampCount));
    localStorage.setItem('progress', JSON.stringify(progress));
    localStorage.setItem('level', JSON.stringify(level));
  }, [stampCount, progress, level]);

  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <h2>마이 등급</h2>
        <div className="level-section">
          <p>현재 등급: <strong>{level}</strong></p>
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
                className={`stamp ${index < stampCount ? 'filled' : ''}`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        <h2>내 쿠폰</h2>
        <div className="coupon-section">
          <p>현재 등급에 따른 쿠폰</p>
          {level === 'BRONZE' && (
            <p>브론즈 등급 1000원 할인 쿠폰 (유효기간: 2025.01.31)</p>
          )}
          {level === 'SILVER' && (
            <p>실버 등급 3000원 할인 쿠폰 (유효기간: 2025.01.31)</p>
          )}
          {level === 'GOLD' && (
            <p>골드 등급 5000원 할인 쿠폰 (유효기간: 2025.01.31)</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
