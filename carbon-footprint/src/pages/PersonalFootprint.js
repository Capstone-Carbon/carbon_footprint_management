import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './../sub_css/CarbonFootprint.css';
import { UserContext } from '../UserContext';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>탄소발자국</h2>
      <ul>
        <li>
          <Link to="/personal" style={{ color: '#4CAF50' }}>
            개인 탄소 배출량
          </Link>
        </li>
        <li>
          <Link to="/company">탄소 챗봇</Link>
        </li>
        <li>
          <Link to="/scenario">탄소 절감 시뮬레이션</Link>
        </li>
      </ul>
    </div>
  );
};

const CarbonPieChart = () => {
  const { username } = useContext(UserContext);
  const [distances, setDistances] = useState({
    car_distance: 0,
    bus_distance: 0,
    walk_distance: 0,
  });
  const [predictedEmission, setPredictedEmission] = useState(null);
  const [treesNeeded, setTreesNeeded] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch(
        `http://127.0.0.1:8000/transport_history/${userId}`
      );
      if (!response.ok) throw new Error(`상태 코드: ${response.status}`);

      const data = await response.json();

      if (data.length > 0) {
        const latest = data[data.length - 1];
        setDistances({
          car_distance: latest.car || 0,
          bus_distance: latest.bus || 0,
          walk_distance: latest.walk || 0,
        });
        console.log('✅ 오늘 이동 거리 데이터 로드:', latest);
      } else {
        console.warn('🚫 이동 거리 데이터가 없습니다.');
      }
    } catch (error) {
      console.error('❌ 사용자 데이터 가져오기 실패:', error.message);
    }
  };

  const fetchPredictedEmission = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(distances),
      });
      if (!response.ok)
        throw new Error('HTTP 오류! 상태 코드: ' + response.status);

      const data = await response.json();
      setPredictedEmission(data.predicted_emission);
    } catch (error) {
      console.error('❌ AI 모델 API 호출 실패:', error.message);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(distances),
      });
      if (!response.ok)
        throw new Error('HTTP 오류! 상태 코드: ' + response.status);

      const data = await response.json();
      setRecommendations(data.recommendations);
      setTreesNeeded(data.trees_needed);
    } catch (error) {
      console.error('❌ 추천 데이터 API 호출 실패:', error.message);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (distances.car_distance !== undefined) {
      fetchPredictedEmission();
      fetchRecommendations();
    }
  }, [distances]);

  const handleShowRecommendations = () => {
    fetchRecommendations();
    setShowRecommendations(!showRecommendations);
  };

  const pieData = {
    labels: ['자가용', '대중교통', '도보'],
    datasets: [
      {
        data: Object.values(distances),
        backgroundColor: ['#4caf50', '#cddc39', '#2196f3'],
      },
    ],
  };

  if (!username || !localStorage.getItem('userId')) {
    return (
      <div className="footprint_container">
        <Sidebar />
        <div className="main-content">
          <h2>개인 탄소 배출량 분석</h2>
          <div
            style={{
              backgroundColor: '#fffbe6',
              padding: '1rem',
              border: '1px solid #ffd700',
              borderRadius: '8px',
              color: '#333',
              textAlign: 'center',
              marginTop: '2rem',
            }}
          >
            <p style={{ margin: 0, fontSize: '1.1rem' }}>
              <strong>로그인이 필요합니다.</strong>
              <br />
              로그인 후 탄소 발자국 분석을 이용하실 수 있어요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="footprint_container">
      <Sidebar />
      <div className="main-content">
        <h2>개인 탄소 배출량 분석</h2>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ width: '280px', height: '280px' }}>
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
          <div>
            {predictedEmission !== null && (
              <>
                <p style={{ fontSize: '1.1rem' }}>
                  🌿 <strong>예측된 탄소 배출량:</strong>{' '}
                  {(predictedEmission / 1000).toFixed(2)} kg CO₂
                </p>
                {treesNeeded !== null && (
                  <p style={{ fontSize: '1.1rem' }}>
                    🌳 <strong>예상 배출량을 상쇄하려면 필요한 나무 수:</strong>{' '}
                    {treesNeeded}그루
                  </p>
                )}
              </>
            )}
          </div>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <button
            className="recommendation-button"
            onClick={handleShowRecommendations}
          >
            탄소 절감 추천 보기
          </button>
          {showRecommendations && recommendations.length > 0 && (
            <div className="recommendations">
              <h3>🌱 탄소 절감 가이드</h3>
              <ul>
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarbonPieChart;
