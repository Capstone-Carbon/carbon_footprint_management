import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import ErrorBoundary from './ErrorBoundary'; // 위 ErrorBoundary 경로에 맞게 수정
import './../sub_css/CarbonFootprint.css';

Chart.register(annotationPlugin);

const regionAverage = 2.1;
const EMISSION_FACTORS = { car: 0.21, bus: 0.089 };

const CarbonScenarioDashboard = () => {
  const [labels, setLabels] = useState([]);
  const [carEmissions, setCarEmissions] = useState([]);
  const [busEmissions, setBusEmissions] = useState([]);
  const [adjustCar, setAdjustCar] = useState(0);
  const [adjustBus, setAdjustBus] = useState(0);
  const [adjustedEmission, setAdjustedEmission] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    fetch(`http://127.0.0.1:8000/transport_history/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.length < 5) {
          setLabels([]);
          setCarEmissions([]);
          setBusEmissions([]);
          return;
        }

        const last5 = data.slice(-5);
        const lastDate = new Date(last5[last5.length - 1].date);

        const predictDates = [1, 2, 3].map((offset) => {
          const d = new Date(lastDate);
          d.setDate(lastDate.getDate() + offset);
          return (
            (d.getMonth() + 1).toString().padStart(2, '0') +
            '-' +
            d.getDate().toString().padStart(2, '0')
          );
        });

        setLabels([...last5.map((d) => d.date.slice(5)), ...predictDates]);

        const nonZeroCar = [...last5].reverse().find((d) => d.car > 0);
        const lastCar = nonZeroCar ? nonZeroCar.car : 1;
        const lastBus = last5[last5.length - 1].bus;

        const predictCar = [lastCar, lastCar, lastCar];
        const predictBus = [lastBus, lastBus, lastBus];

        setCarEmissions([...last5.map((d) => d.car), ...predictCar]);
        setBusEmissions([...last5.map((d) => d.bus), ...predictBus]);
      });
  }, []);

  useEffect(() => {
    const newAdjusted = carEmissions.map((car, i) => {
      const bus = busEmissions[i] || 0;
      const isPrediction = i >= carEmissions.length - 3;

      const adjCar = isPrediction ? car * (1 + adjustCar / 100) : car;
      const adjBus = isPrediction ? bus * (1 + adjustBus / 100) : bus;

      const totalEmission =
        adjCar * EMISSION_FACTORS.car + adjBus * EMISSION_FACTORS.bus;

      return +totalEmission.toFixed(2);
    });

    setAdjustedEmission(newAdjusted);
  }, [adjustCar, adjustBus, carEmissions, busEmissions]);

  const rawTotalEmissions = carEmissions.map(
    (car, i) =>
      +(
        car * EMISSION_FACTORS.car +
        (busEmissions[i] || 0) * EMISSION_FACTORS.bus
      ).toFixed(2)
  );

  if (labels.length < 5) {
    return (
      <div className="footprint_container">
        <div className="main-content">
          <h2>탄소 절감 시뮬레이션</h2>
          <p>데이터가 부족하여 차트를 표시할 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const predictStart = Math.max(0, labels.length - 3 - 0.5);
  const predictEnd = Math.max(0, labels.length - 0.5);

  const chartData = {
    labels,
    datasets: [
      {
        label: '나의 탄소배출량 (kg CO₂)',
        data: rawTotalEmissions,
        borderColor: 'rgba(54,162,235,1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(54,162,235,1)',
      },
      {
        label: '전국 평균 (kg CO₂)',
        data: new Array(labels.length).fill(regionAverage),
        borderColor: 'rgba(0,200,0,1)',
        borderDash: [4, 4],
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.4,
      },
      {
        label: '조정 시나리오 (예측일만 반영) (kg CO₂)',
        data: adjustedEmission,
        borderColor: 'rgba(255,99,132,1)',
        borderDash: [2, 3],
        borderWidth: 3,
        pointRadius: 3,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      // annotation 플러그인 아예 사용 안 함 (임시 회피)
      // annotation: { ... }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'kg CO₂',
        },
      },
    },
  };

  return (
    <ErrorBoundary>
      <div className="footprint_container">
        <div className="sidebar">
          <h2>탄소발자국</h2>
          <ul>
            <li>
              <a href="/personal">개인 탄소 배출량</a>
            </li>
            <li>
              <a href="/company">탄소 챗봇</a>
            </li>
            <li>
              <a href="/scenario" style={{ color: '#4CAF50' }}>
                탄소 절감 시뮬레이션
              </a>
            </li>
          </ul>
        </div>

        <div className="main-content">
          <h2>탄소 절감 시뮬레이션</h2>
          <p>최근 5일의 탄소 배출량과 예측 결과를 비교해보세요.</p>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>
                자가용 예측 조정 (%): {adjustCar}
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={1}
                  value={adjustCar}
                  onChange={(e) => setAdjustCar(Number(e.target.value))}
                  style={{
                    width: '100%',
                    maxWidth: 500,
                    accentColor: '#4CAF50',
                  }}
                />
              </label>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>
                대중교통 예측 조정 (%): {adjustBus}
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={1}
                  value={adjustBus}
                  onChange={(e) => setAdjustBus(Number(e.target.value))}
                  style={{
                    width: '100%',
                    maxWidth: 500,
                    accentColor: '#4CAF50',
                  }}
                />
              </label>
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: 1000 }}>
            <Line data={chartData} options={chartOptions} />
          </div>

          <div style={{ marginTop: 20 }}>
            <strong>예측 변화량:</strong>{' '}
            {(
              adjustedEmission.slice(-3).reduce((a, b) => a + b, 0) -
              rawTotalEmissions.slice(-3).reduce((a, b) => a + b, 0)
            ).toFixed(2)}{' '}
            kg CO₂
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CarbonScenarioDashboard;
