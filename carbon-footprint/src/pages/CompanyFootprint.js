import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./../sub_css/Company.css"; // 스타일 분리

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>탄소발자국</h2>
      <ul>
        <li><Link to="/personal">개인 탄소 배출량</Link></li>
        <li><Link to="/company" style={{ color: "#4CAF50" }}>기업 탄소 배출량</Link></li>
      </ul>
    </div>
  );
};

const CompanyCarbonFootprint = () => {
    // 최근 3개 년도의 데이터 (임의 데이터)
    const carbonData = {
      labels: ["2022", "2023", "2024"],
      datasets: [
        {
          label: "TOE (Tons of Oil Equivalent)",
          data: [1200, 1180, 1150], // TOE 값
          backgroundColor: "rgba(76, 175, 80, 0.6)", // 연한 녹색
        },
        {
          label: "탄소 배출량 (톤)",
          data: [1300, 1250, 1200], // 탄소 배출량
          backgroundColor: "rgba(33, 150, 243, 0.6)", // 연한 파랑
        },
      ],
    };

    return (
    <div className="footprint_container">
      <Sidebar />
      <div className="main-content">
      <h2>기업 탄소 배출량 분석</h2>
      <div id="instruction">
        <h2>📌 TOE란?</h2>
        <p>산업체가 사용하는 에너지의 종류에 따라 탄소 배출량을 계산하는 것으로, 각 에너지의 탄소 배출계수를 사용해 총배출량을 계산하고, 이를 TOE로 환산하여 탄소 배출량 (tCo2) 을 확인할 수 있습니다.
        </p>
      </div>
      <div className="chart-container bar-chart">
        <Bar data={carbonData} />
      </div>
        <div className="clear"></div>
      </div> 
      </div>
      
    );
  };

export default CompanyCarbonFootprint;
