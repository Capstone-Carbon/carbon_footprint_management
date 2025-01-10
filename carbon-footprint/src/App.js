import React from "react";
import "./App.css";
import footprint from './images/footprint.png'

function App() {
  // Open/Close Navigation Handlers
  const openNav = () => {
    document.getElementById("mySidenav").style.width = "200px";
  };

  const closeNav = () => {
    document.getElementById("mySidenav").style.width = "0";
  };

  return (
    <div>
      {/* Header */}
      <header>
        <div className="wrapper">
          <div id="navbar">
            <div>
              <img src={footprint} alt="footprint" className="logo" />
            </div>
            <div className="menu">
              <a href="#" className="main_menu">
                탄소 발자국
              </a>
              <div id="community">
                <a href="#" className="main_menu">
                  커뮤니티
                </a>
                <div className="dropdown_menu">
                  <a href="#">커뮤니티</a>
                  <a href="#">챌린지</a>
                </div>
              </div>
              <a href="#" className="main_menu">
                이벤트
              </a>
              <div id="mypage">
                <a href="#" className="main_menu">
                  MY PAGE
                </a>
                <div className="dropdown_menu">
                  <a href="#">MY 등급</a>
                  <a href="#">MY 쿠폰</a>
                </div>
              </div>
              <a href="#" className="login">
                로그인
              </a>
            </div>
            <span
              className="sidebtn"
              style={{ fontSize: "30px", cursor: "pointer" }}
              onClick={openNav}
            >
              &#9776;
            </span>
            <div id="mySidenav" className="sidenav">
              <a
                href="javascript:void(0)"
                className="closebtn"
                onClick={closeNav}
              >
                &times;
              </a>
              <a href="#" className="sideLogin">
                로그인
              </a>
              <a href="#" className="sideMenu">
                탄소 발자국
              </a>
              <a href="#" className="sideMenu">
                커뮤니티
              </a>
              <a href="#" className="sideMenu">
                이벤트
              </a>
              <a href="#" className="sideMenu">
                MY PAGE
              </a>
            </div>
          </div>
        </div>
        <div className="clear"></div>
      </header>

      {/* Main */}
      <main>
        <div className="wrapper">
          <section className="dashboard">
            <div className="my-carbon">
              <h2>나의 탄소 발자국</h2>
              <div className="chart">
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
              <p>한 달 내로 탄소 배출량을 10% 줄일 수 있을 것으로 예측됩니다.</p>
              <button>목표 설정</button>
            </div>
          </section>
        </div>

        <section className="info">
          <iframe
            width="33%"
            height="100%"
            src="https://www.youtube.com/embed/SYlrvtavzs4?si=eY8N-5bbdnbOG41h"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
          <iframe
            width="33%"
            height="100%"
            src="https://www.youtube.com/embed/33iJXjIl7sI?si=jgvdi0mzNoYexpux"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
          <iframe
            width="33%"
            height="100%"
            src="https://www.youtube.com/embed/cLYg_M5jo00?si=sIF2WfsvTT9HT8KF"
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
  );
}

export default App;
