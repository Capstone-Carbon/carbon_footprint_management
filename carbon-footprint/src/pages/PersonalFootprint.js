import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './../sub_css/CarbonFootprint.css';

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
  const [distances, setDistances] = useState({
    car_distance: 0,
    bus_distance: 0,
    walk_distance: 0,
  });
  const [predictedEmission, setPredictedEmission] = useState(null);
  const [treesNeeded, setTreesNeeded] = useState(null); // 🌲 추가
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let userId = localStorage.getItem('userId');
        if (!userId) {
          console.warn('❌ 로그인된 사용자 ID 없음. 기본값 user1로 설정.');
          userId = 'user1';
          localStorage.setItem('userId', userId);
        }

        const response = await fetch(
          `http://127.0.0.1:8000/user_data?user_id=${userId}`
        );

        if (!response.ok)
          throw new Error(
            `사용자 데이터를 불러올 수 없습니다. 상태 코드: ${response.status}`
          );

        const data = await response.json();

        setDistances({
          car_distance: data.car_distance || 0,
          bus_distance: data.bus_distance || 0,
          walk_distance: data.walk_distance || 0,
        });
      } catch (error) {
        console.error('❌ 사용자 데이터 가져오기 실패:', error.message);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (distances.car_distance !== undefined) {
      fetchPredictedEmission();
      fetchRecommendations();
    }
  }, [distances]);

  const fetchPredictedEmission = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(distances),
      });

      if (!response.ok)
        throw new Error('HTTP 오류! 상태 코드: ' + response.status);

      const data = await response.json();
      setRecommendations(data.recommendations);
      setTreesNeeded(data.trees_needed); // 🌲 필요한 나무 수 저장
    } catch (error) {
      console.error('❌ 추천 데이터 API 호출 실패:', error.message);
    }
  };

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
              <>
                <p>
                  <strong> 예측된 탄소 배출량 (AI 모델):</strong>{' '}
                  {predictedEmission.toFixed(2)} g CO₂
                </p>
                {treesNeeded !== null && (
                  <p>
                    <strong>🌳 예상 배출량을 상쇄하려면 필요한 나무 수:</strong>{' '}
                    {treesNeeded}그루
                  </p>
                )}
              </>
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
