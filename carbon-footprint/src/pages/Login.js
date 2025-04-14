import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import "./../App.css";

function LoginForm() {
  const navigate = useNavigate();
  const { setUsername } = useContext(UserContext);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username) {
      setErrorMessage("아이디를 입력해주세요.");
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage("비밀번호는 최소 6자리 이상이어야 합니다.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert("로그인이 완료되었습니다!");
      setUsername(formData.username); // Update username state
      localStorage.setItem("userId", formData.username); // ✅ localStorage에 저장
      navigate("/");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleJoinClick = () => {
    navigate("/join"); // 회원가입 페이지로 이동
  };

  return (
    <div className="wrapper">
      <div id="login_form">
        <div id="login_inner">
          <h2>로그인</h2>
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
            <button type="submit" id="loginbtn">
              Login
            </button>
            <button type="button" id="joinbtn" onClick={handleJoinClick}>
              회원가입
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
