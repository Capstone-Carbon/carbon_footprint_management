import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './../sub_css/CarbonFootprint.css'; // 스타일 분리

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
          <Link to="/company">기업 탄소 배출량</Link>
        </li>
      </ul>
    </div>
  );
};

const CarbonPieChart = () => {
  const [distances, setDistances] = useState(null);
  const [predictedEmission, setPredictedEmission] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          'http://127.0.0.1:8000/user_data?user_id=user1'
        );
        if (!response.ok)
          throw new Error('사용자 데이터를 불러올 수 없습니다.');
        const data = await response.json();
        setDistances(data);
      } catch (error) {
        console.error('❌ 사용자 데이터 가져오기 실패:', error);
      }
    };

    fetchUserData(); // ✅ 처음 한 번 실행하여 데이터 불러오기
  }, []);

  useEffect(() => {
    if (distances) {
      fetchPredictedEmission(); // ✅ 예측 값 자동 업데이트
      fetchRecommendations(); // ✅ 추천 값 자동 업데이트
    }
  }, [distances]);

  const fetchPredictedEmission = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/predict?${new URLSearchParams(
          distances
        ).toString()}`
      );
      if (!response.ok)
        throw new Error('HTTP 오류! 상태 코드: ' + response.status);
      const data = await response.json();
      setPredictedEmission(data.predicted_emission);
    } catch (error) {
      console.error('❌ API 호출 실패:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/recommend?${new URLSearchParams(
          distances
        ).toString()}`
      );
      if (!response.ok)
        throw new Error('HTTP 오류! 상태 코드: ' + response.status);
      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('❌ 추천 데이터 가져오기 실패:', error);
    }
  };

  const handleShowRecommendations = () => {
    fetchRecommendations(); // ✅ 버튼 클릭 시 최신 추천 요청
    setShowRecommendations(!showRecommendations);
  };

  const pieData = distances
    ? {
        labels: ['자가용', '대중교통', '자전거', '도보', '기차'],
        datasets: [
          {
            data: Object.values(distances),
            backgroundColor: [
              '#4caf50',
              '#cddc39',
              '#ff9800',
              '#2196f3',
              '#9c27b0',
            ],
          },
        ],
      }
    : {
        labels: ['자가용', '대중교통', '자전거', '도보', '기차'],
        datasets: [
          {
            data: [1, 1, 1, 1, 1],
            backgroundColor: [
              '#4caf50',
              '#cddc39',
              '#ff9800',
              '#2196f3',
              '#9c27b0',
            ],
          },
        ],
      };

  return (
    <div className="footprint_container">
      <Sidebar />
      <div className="main-content">
        <h2>개인 탄소 배출량 분석</h2>
        <div className="chart-prediction-wrapper">
          <div className="chart2-container">
            {pieData && <Pie data={pieData} />}
          </div>
          <div className="prediction-info">
            {predictedEmission !== null && (
              <p>
                <strong>🚀 예측된 탄소 배출량 (AI 모델):</strong>{' '}
                {predictedEmission.toFixed(2)} g CO₂
              </p>
            )}
            <button
              className="recommendation-button"
              onClick={handleShowRecommendations}
            >
              탄소 절감 추천 보기
            </button>
            {showRecommendations && recommendations.length > 0 && (
              <div className="recommendations">
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
    </div>
  );
};

export default CarbonPieChart;
