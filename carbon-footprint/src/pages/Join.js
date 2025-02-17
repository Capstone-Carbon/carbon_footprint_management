import React, { useState } from "react";
import "./../App.css";

function Join() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.username) {
      setErrorMessage("아이디를 입력해주세요.");
      return;
    }
    if (!formData.email) {
      setErrorMessage("이메일을 입력해주세요.");
      return;
    }
    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("올바른 이메일 형식이 아닙니다.");
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage("비밀번호는 최소 6자리 이상이어야 합니다.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 에러 메시지 초기화 후 서버로 전송 로직
    setErrorMessage("");
    console.log("폼 데이터 제출:", formData);
    alert("회원가입이 완료되었습니다!");
  };

  return (
    <div className="wrapper">
      <div id="join">
        <div id="join_inner">
          <h2>회원가입</h2>
          <hr />
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          <form onSubmit={handleSubmit}>
            <div>
              <span>아이디</span>
              <input
                type="text"
                name="username"
                placeholder="아이디를 입력해주세요."
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <br />
            <div>
              <span>이메일</span>
              <input
                type="text"
                name="email"
                placeholder="이메일을 입력해주세요."
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <br />
            <div>
              <span>비밀번호</span>
              <input
                type="password"
                name="password"
                placeholder="비밀번호를 입력해주세요."
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <br />
            <div>
              <span>비밀번호<br />확인</span>
              <input
                type="password"
                name="confirmPassword"
                placeholder="비밀번호를 다시 입력해주세요."
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <br />
            <button type="submit" id="confirm">확인</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Join;
