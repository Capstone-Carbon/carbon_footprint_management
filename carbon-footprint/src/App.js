import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import LoginForm from "./pages/Login";
import Join from "./pages/Join";
import PersonalFootprint from "./pages/PersonalFootprint";
import CompanyFootprint from "./pages/CompanyFootprint";
import Community from "./pages/CommunityMain";
import CommunityWrite from "./pages/CommunityWrite";
import Challenge from "./pages/ChallengeMain";
import ChallengeWrite from "./pages/ChallengeWrite";
import EventPage from "./pages/EventMain"; 
import MyPage from "./pages/MypageMain";
import footprint from "./images/footprint.png";

// 사이드바 핸들러 함수
const openNav = () => {
  document.getElementById("mySidenav").style.width = "200px";
};

const closeNav = () => {
  document.getElementById("mySidenav").style.width = "0";
};

const Sidebar = () => {
  const location = useLocation();

  // 📌 페이지 이동 시 자동으로 사이드바 닫기
  useEffect(() => {
    closeNav();
  }, [location]);

  return (
    <div>
      <span className="sidebtn" style={{ fontSize: "30px", cursor: "pointer" }} onClick={openNav}>
        &#9776;
      </span>
      <div id="mySidenav" className="sidenav">
        <a href="javascript:void(0)" className="closebtn" onClick={closeNav}>
          &times;
        </a>
        <Link to="/login" className="sideLogin" onClick={closeNav}>
          로그인
        </Link>
        <Link to="/personal" className="sideMenu" onClick={closeNav}>
          탄소 발자국
        </Link>
        <Link to="/community" className="sideMenu" onClick={closeNav}>
          커뮤니티
        </Link>
        <Link to="/event" className="sideMenu" onClick={closeNav}>
          이벤트
        </Link>
        <Link to="/mypage" className="sideMenu" onClick={closeNav}>
          MY PAGE
        </Link>
      </div>
    </div>
  );
};

function App() {
  const [stampCount, setStampCount] = useState(3); // 스탬프 개수 관리

  return (
    <Router>
      <div id="root">
        {/* Header */}
        <header>
          <div className="wrapper">
            <div id="navbar">
              <div>
                <Link to="/" className="logo-link">
                  <img src={footprint} alt="footprint" className="logo" />
                </Link>
              </div>
              <div className="menu">
                <Link to="/personal" className="main_menu">
                  탄소 발자국
                </Link>
                <div id="community">
                  <Link to="/community" className="main_menu">
                    커뮤니티
                  </Link>
                  <div className="dropdown_menu">
                    <Link to="/community">커뮤니티</Link>
                    <Link to="/challenge">챌린지</Link>
                  </div>
                </div>
                <Link to="/event" className="main_menu">
                  이벤트
                </Link>
                <Link to="/mypage" className="main_menu">
                  MY PAGE
                </Link>
                <Link to="/login" className="login">
                  로그인
                </Link>
              </div>
              <Sidebar />
            </div>
          </div>
          <div className="clear"></div>
        </header>

        {/* Main */}
        <main>
          <Routes>
            {/* 기본 경로 */}
            <Route
              path="/"
              element={
                <div className="wrapper">
                  <section className="dashboard">
                    <div className="my-carbon">
                      <h2>나의 탄소 발자국</h2>
                      <div className="mainpage_chart">
                        <div className="bar" style={{ height: "40%" }}>
                          12/01
                        </div>
                        <div className="bar" style={{ height: "50%" }}>
                          12/02
                        </div>
                        <div className="bar" style={{ height: "30%" }}>
                          12/03
                        </div>
                        <div className="bar" style={{ height: "20%" }}>
                          12/04
                        </div>
                        <div className="bar active" style={{ height: "70%" }}>
                          12/05
                        </div>
                      </div>
                    </div>
                    
                    <div className="goal-section">
                      <p>
                        한 달 내로 탄소 배출량을 10% 줄일 수 있을 것으로
                        예측됩니다.
                      </p>
                      <Link to="/personal" className="sideMenu">
                        <button> 목표 설정</button>
                      </Link>
                    </div>
                  </section>

                  <section className="info">
                    <iframe
                      width="33%"
                      height="100%"
                      src="https://www.youtube.com/embed/SYlrvtavzs4"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    ></iframe>
                    <iframe
                      width="33%"
                      height="100%"
                      src="https://www.youtube.com/embed/33iJXjIl7sI"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    ></iframe>
                    <iframe
                      width="33%"
                      height="100%"
                      src="https://www.youtube.com/embed/cLYg_M5jo00"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    ></iframe>
                  </section>

                  <div className="content">
                    <div className="wrapper">
                      <div className="notice">
                        <h3 id="notice_txt">공지사항</h3>
                        <span className="notice_plus">+</span>
                        <div className="clear"></div>
                        <hr style={{ width: "100%" }} />
                        <p>홈페이지 점검시간: 2024 - 11 - 20</p>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />

            {/* 페이지 경로 */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/join" element={<Join />} />

            <Route path="/personal" element={<PersonalFootprint />} />
            <Route path="/company" element={<CompanyFootprint />} />

            <Route path="/community" element={<Community />} />
            <Route path="/communityWrite" element={<CommunityWrite />} />
            <Route path="/challenge" element={<Challenge />} />
            <Route path="/challengeWrite" element={<ChallengeWrite />} />

            <Route path="/mypage" element={<MyPage stampCount={stampCount} />} />
            <Route path="/event" element={<EventPage stampCount={stampCount} setStampCount={setStampCount} />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer>
          <div className="wrapper">
            <div id="footer_content">
              <div className="f_cont1">
                <p>2025년도 5팀 졸업작품</p>
                <p>프로젝트 이름 : 탄소 발자국 관리</p>
                <p>444610 울산광역시 남구 대학로 93 (무거동)</p>
              </div>
              <div className="f_cont2">
                <p>조원</p>
                <p>김세희, 서상우, 설상현</p>
              </div>
              <div className="clear"></div>
            </div>
          </div>
        </footer>

      </div>
    </Router>
  );
}

export default App;
