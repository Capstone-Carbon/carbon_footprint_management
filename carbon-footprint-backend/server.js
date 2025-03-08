const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ✅ SQLite3 데이터베이스 연결
const db = new sqlite3.Database("./users.db", (err) => {
  if (err) {
    console.error("❌ SQLite 연결 실패:", err.message);
  } else {
    console.log("✅ SQLite 연결 성공");
  }
});

// ✅ users 테이블 생성 (없으면 자동 생성)
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`
);

// ✅ 회원가입 API
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || password.length < 6) {
    return res.status(400).json({ message: "아이디와 6자리 이상의 비밀번호를 입력하세요." });
  }

  try {
    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, row) => {
      if (row) {
        return res.status(400).json({ message: "이미 존재하는 아이디입니다." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], (err) => {
        if (err) {
          return res.status(500).json({ message: "회원가입 실패", error: err.message });
        }
        res.status(201).json({ message: "회원가입 성공" });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "서버 오류", error });
  }
});

// ✅ 로그인 API
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (!user) {
      return res.status(400).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "로그인 성공", token });
  });
});

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});