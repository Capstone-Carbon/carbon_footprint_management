import React, { useState, useEffect, useContext } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';
import LoginForm from './pages/Login';
import Join from './pages/Join';
import PersonalFootprint from './pages/PersonalFootprint';
import CompanyFootprint from './pages/CompanyFootprint';
import Community from './pages/CommunityMain';
import CommunityWrite from './pages/CommunityWrite';
import CommunityCheck from './pages/CommunityCheck';
import EventPage from './pages/EventMain';
import MyPage from './pages/MypageMain';
import footprint from './images/footprint.png';
import { UserProvider, UserContext } from './UserContext';
import CarbonScenarioDashboard from './pages/CarbonScenarioDashboard';

// 사이드바 핸들러 함수
const openNav = () => {
  document.getElementById('mySidenav').style.width = '200px';
};

const closeNav = () => {
  document.getElementById('mySidenav').style.width = '0';
};

const Sidebar = () => {
  const location = useLocation();
  const { username } = useContext(UserContext);

  // 📌 페이지 이동 시 자동으로 사이드바 닫기
  useEffect(() => {
    closeNav();
  }, [location]);

  return (
    <div>
      <span
        className="sidebtn"
        style={{ fontSize: '30px', cursor: 'pointer' }}
        onClick={openNav}
      >
        &#9776;
      </span>
      <div id="mySidenav" className="sidenav">
        <a href="javascript:void(0)" className="closebtn" onClick={closeNav}>
          &times;
        </a>
        {username ? (
          <span className="sideLogin">{username}</span>
        ) : (
          <Link to="/login" className="sideLogin" onClick={closeNav}>
            로그인
          </Link>
        )}
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
  const [userId, setUserId] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [trendResult, setTrendResult] = useState(null);
  const [stampCount, setStampCount] = useState(3); // 스탬프 개수 관리

  // ✅ userId를 로컬 스토리지에서 먼저 읽어오기
  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      setUserId(storedId);
    }
  }, []);

  // ✅ userId가 있을 때만 fetch 시작
  useEffect(() => {
    if (userId) {
      fetchGraphData(userId);
      fetchTrendPrediction(userId);
    }
  }, [userId]);

  const fetchGraphData = async (uid) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/transport_history/${uid}`);
      if (!response.ok) throw new Error('그래프 데이터 로드 실패');

      const data = await response.json();
      setGraphData(data);
    } catch (error) {
      console.error('❌ 그래프 로딩 실패:', error);
    }
  };

  const fetchTrendPrediction = async (uid) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/predict_trend/${uid}`);
      if (!response.ok) throw new Error('예측 요청 실패');

      const data = await response.json();
      setTrendResult(data);
    } catch (error) {
      console.error('❌ 예측 실패:', error);
    }
  };
  
  return (
    <UserProvider>
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
                    </div>
                  </div>
                  <Link to="/event" className="main_menu">
                    이벤트
                  </Link>
                  <Link to="/mypage" className="main_menu">
                    MY PAGE
                  </Link>
                  <UserContext.Consumer>
                    {({ username, logout }) =>
                      username ? (
                        <div className="userInfo">
                          <span>{username}님</span>
                          <button onClick={logout} className="logoutButton">
                            로그아웃
                          </button>
                        </div>
                      ) : (
                        <Link to="/login" className="login">
                          로그인
                        </Link>
                      )
                    }
                  </UserContext.Consumer>
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


                          {graphData.length > 0 ? (
                            graphData.map((entry, index) => {
                              const total =
                                Number(entry.car || 0) +
                                Number(entry.bus || 0) +
                                Number(entry.walk || 0);
                              const max = Math.max(
                                ...graphData.map(
                                  (e) =>
                                    Number(e.car || 0) +
                                    Number(e.bus || 0) +
                                    Number(e.walk || 0)
                                )
                              );
                              const height =
                                max > 0 ? Math.round((total / max) * 100) : 0;

                              return (
                                <div
                                  key={index}
                                  className={`bar ${
                                    index === graphData.length - 1
                                      ? 'active'
                                      : ''
                                  }`}
                                  style={{ height: `${height}%` }}
                                >
                                  {entry.date.slice(5)}
                                </div>
                              );
                            })
                          ) : (
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '200px',
                                width: '100%',
                              }}
                            >
                              <p
                                style={{
                                  fontSize: '16px',
                                  color: '#999',
                                  margin: 0,
                                }}
                              >
                                🚫 최근 5일치 이동 데이터를 불러올 수 없습니다.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="goal-section">
                        <p>
                          {trendResult
                            ? (() => {
                                const today = trendResult.today_emission_g;
                                const tomorrow =
                                  trendResult.tomorrow_prediction
                                    .predicted_emission_g;
                                const rate = ((tomorrow - today) / today) * 100;
                                const absRate = Math.abs(rate).toFixed(1);
                                if (rate > 0) {
                                  return `현재 이동 패턴을 유지하면 탄소 배출량이 약 ${absRate}% 늘어날 것으로 예측됩니다.`;
                                } else if (rate < 0) {
                                  return `현재 이동 패턴을 유지하면 탄소 배출량이 약 ${absRate}% 줄어들 것으로 예측됩니다.`;
                                } else {
                                  return `현재 이동 패턴을 유지하면 탄소 배출량은 큰 변화 없이 유지될 것으로 예측됩니다.`;
                                }
                              })()
                            : '5일간 탄소 배출량 예측 결과를 불러오는 중입니다...'}
                        </p>
                        <Link to="/personal" className="sideMenu">
                          <button> 오늘의 탄소 발자국 분석 </button>
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
                          <hr style={{ width: '100%' }} />
                          <p>
                            홈페이지 점검시간: {new Date().getFullYear()} -{' '}
                            {String(new Date().getMonth() + 1).padStart(2, '0')}{' '}
                            - {String(new Date().getDate()).padStart(2, '0')}
                          </p>
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
              <Route path="/scenario" element={<CarbonScenarioDashboard />} />

              <Route path="/community" element={<Community />} />
              <Route path="/communityWrite" element={<CommunityWrite />} />
              <Route path="/communityCheck/:id" element={<CommunityCheck />} />

              <Route
                path="/mypage"
                element={<MyPage stampCount={stampCount} />}
              />
              <Route
                path="/event"
                element={
                  <EventPage
                    stampCount={stampCount}
                    setStampCount={setStampCount}
                  />
                }
              />
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
    </UserProvider>
  );
}

export default App;
