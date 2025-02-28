import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import "./../sub_css/CarbonFootprint.css"; // 스타일 분리

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>탄소발자국</h2>
      <ul>
        <li><Link to="/personal" style={{ color: "#4CAF50" }}>개인 탄소 배출량</Link></li>
        <li><Link to="/company">기업 탄소 배출량</Link></li>
      </ul>
    </div>
  );
};

const CarbonPieChart = () => {
  const [distances, setDistances] = useState({
    car: 15,
    bus: 25,
    bicycle: 5,
    walk: 3,
    train: 10,
  });

  const emissionFactors = {
    car: 180,
    bus: 80,
    bicycle: 0,
    walk: 0,
    train: 40,
  };

  const totalDistance = Object.values(distances).reduce((sum, value) => sum + value, 0);
  const totalEmissions = Object.keys(distances).reduce(
    (sum, key) => sum + distances[key] * emissionFactors[key],
    0
  );

  const data = {
    labels: ["자가용", "대중교통", "자전거", "도보", "기차"],
    datasets: [
      {
        data: totalDistance > 0
          ? [
              (distances.car / totalDistance) * 100,
              (distances.bus / totalDistance) * 100,
              (distances.bicycle / totalDistance) * 100,
              (distances.walk / totalDistance) * 100,
              (distances.train / totalDistance) * 100,
            ]
          : [0, 0, 0, 0, 0],
        backgroundColor: ["#4caf50", "#cddc39", "#ff9800", "#2196f3", "#9c27b0"],
      },
    ],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDistances((prev) => ({ ...prev, [name]: Number(value) }));
  };

  return (
    <div className="footprint_container">
      <Sidebar />
      <div className="main-content">
        <h2>개인 탄소 배출량 분석</h2>
        <div className="chart2-container pie-chart" >
          <Pie data={data} />
        </div>
        
        
        <div className="ChartContent">
          <div className="ChartNumber">
            <div className="distance">
              <label>자가용 거리(km): </label>
              <input className="write_distaance" type="number" name="car" value={distances.car} onChange={handleChange} />
            </div>
            <div className="distance">
              <label>대중교통 거리(km): </label>
              <input className="write_distaance" type="number" name="bus" value={distances.bus} onChange={handleChange} />
            </div>
            <div className="distance">
              <label>자전거 거리(km): </label>
              <input className="write_distaance" type="number" name="bicycle" value={distances.bicycle} onChange={handleChange} />
            </div>
            <div className="distance">
              <label>도보 거리(km): </label>
              <input className="write_distaance" type="number" name="walk" value={distances.walk} onChange={handleChange} />
            </div>
            <div className="distance">
              <label>기차 거리(km): </label>
              <input className="write_distaance" type="number" name="train" value={distances.train} onChange={handleChange} />
            </div>
          </div>

          <div className="clear"></div>
        </div>
        
        <div className="total">
          <p><strong>총 이동 거리:</strong> {totalDistance} km</p>
          <p><strong>총 탄소 배출량:</strong> {totalEmissions.toFixed(2)} g CO₂</p>
        </div>
        
      </div>
    </div>
  );
};

export default CarbonPieChart;
