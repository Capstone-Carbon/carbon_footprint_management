const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

const db = new sqlite3.Database('./users.db', (err) => {
  if (err) console.error('❌ SQLite 연결 실패:', err.message);
  else console.log('✅ SQLite 연결 성공');
});

// ✅ users 테이블
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
)`);

// ✅ posts 테이블
db.run(`CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  author TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// ✅ comments 테이블
db.run(`CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  parent_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// 회원가입
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || password.length < 6) {
    return res
      .status(400)
      .json({ message: '아이디와 6자리 이상의 비밀번호를 입력하세요.' });
  }
  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, row) => {
      if (row)
        return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });
      const hashedPassword = await bcrypt.hash(password, 10);
      db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        async (err) => {
          if (err)
            return res
              .status(500)
              .json({ message: '회원가입 실패', error: err.message });
          try {
            await axios.post('http://127.0.0.1:8000/update_user_data', {
              user_id: username,
              car_distance: 0,
              bus_distance: 0,
              walk_distance: 0,
            });
            console.log('✅ FastAPI 사용자 이동 거리 초기화 완료');
          } catch (fastapiErr) {
            console.error('❌ FastAPI 사용자 초기화 실패:', fastapiErr.message);
          }
          res.status(201).json({ message: '회원가입 성공' });
        }
      );
    }
  );
});

// 로그인
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, user) => {
      if (!user)
        return res
          .status(400)
          .json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res
          .status(400)
          .json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      });
      res.json({ message: '로그인 성공' });
    }
  );
});

// 로그아웃
app.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: false, sameSite: 'Lax' });
  res.json({ message: '로그아웃 성공' });
});

// 사용자 이름 가져오기
app.get('/username', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: '로그인 필요' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ username: decoded.username });
  } catch {
    res.status(401).json({ message: '유효하지 않은 토큰' });
  }
});

// 글 작성
app.post('/posts', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: '로그인 필요' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { title, detail } = req.body;
    const author = decoded.username;
    db.run(
      'INSERT INTO posts (title, detail, author) VALUES (?, ?, ?)',
      [title, detail, author],
      function (err) {
        if (err)
          return res
            .status(500)
            .json({ message: '글 작성 실패', error: err.message });
        res.status(201).json({ message: '글 작성 성공', postId: this.lastID });
      }
    );
  } catch {
    res.status(401).json({ message: '유효하지 않은 토큰' });
  }
});

// 글 목록 조회
app.get('/posts', (req, res) => {
  db.all('SELECT * FROM posts ORDER BY created_at DESC', [], (err, rows) => {
    if (err)
      return res
        .status(500)
        .json({ message: '글 목록 조회 실패', error: err.message });
    res.json(rows);
  });
});

// TOP2 인기글 조회
app.get('/posts/top', (req, res) => {
  db.all('SELECT * FROM posts ORDER BY views DESC LIMIT 2', [], (err, rows) => {
    if (err)
      return res
        .status(500)
        .json({ message: '랭킹 조회 실패', error: err.message });
    res.json(rows);
  });
});

// 글 상세 조회
app.get('/posts/:id', (req, res) => {
  const postId = req.params.id;
  db.get('SELECT * FROM posts WHERE id = ?', [postId], (err, row) => {
    if (err)
      return res
        .status(500)
        .json({ message: '글 조회 실패', error: err.message });
    if (!row)
      return res.status(404).json({ message: '글을 찾을 수 없습니다.' });
    res.json(row);
  });
});

// 글 삭제
app.delete('/posts/:id', (req, res) => {
  const postId = req.params.id;
  db.run('DELETE FROM posts WHERE id = ?', [postId], function (err) {
    if (err)
      return res
        .status(500)
        .json({ message: '글 삭제 실패', error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ message: '글을 찾을 수 없습니다.' });
    res.status(200).json({ message: '글 삭제 성공' });
  });
});

// 조회수 증가
app.post('/posts/:id/views', (req, res) => {
  const postId = req.params.id;
  db.run(
    'UPDATE posts SET views = views + 1 WHERE id = ?',
    [postId],
    function (err) {
      if (err)
        return res
          .status(500)
          .json({ message: '조회수 증가 실패', error: err.message });
      res.status(200).json({ message: '조회수 증가 성공' });
    }
  );
});

// 댓글 목록 조회
app.get('/posts/:id/comments', (req, res) => {
  const postId = req.params.id;
  db.all(
    'SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC',
    [postId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: '댓글 조회 실패' });
      res.json(rows);
    }
  );
});

// 댓글/답글 작성
app.post('/posts/:id/comments', (req, res) => {
  const postId = req.params.id;
  const { author, text, parent_id } = req.body;
  if (!author || !text)
    return res
      .status(400)
      .json({ message: '작성자 또는 내용이 비어 있습니다.' });
  db.run(
    'INSERT INTO comments (post_id, author, text, parent_id) VALUES (?, ?, ?, ?)',
    [postId, author, text, parent_id || null],
    function (err) {
      if (err)
        return res
          .status(500)
          .json({ message: '댓글 작성 실패', error: err.message });
      res
        .status(201)
        .json({ message: '댓글 작성 성공', commentId: this.lastID });
    }
  );
});

// 댓글 삭제
app.delete('/comments/:id', (req, res) => {
  const commentId = req.params.id;
  db.run('DELETE FROM comments WHERE id = ?', [commentId], function (err) {
    if (err)
      return res.status(500).json({ message: '댓글 삭제 실패', error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ message: '해당 댓글을 찾을 수 없습니다.' });
    res.status(200).json({ message: '댓글 삭제 성공' });
  });
});

// 댓글 수정
app.put('/comments/:id', (req, res) => {
  const commentId = req.params.id;
  const { text } = req.body;
  if (!text)
    return res.status(400).json({ message: '수정할 내용이 없습니다.' });
  db.run(
    'UPDATE comments SET text = ? WHERE id = ?',
    [text, commentId],
    function (err) {
      if (err)
        return res.status(500).json({ message: '댓글 수정 실패', error: err.message });
      if (this.changes === 0)
        return res.status(404).json({ message: '해당 댓글을 찾을 수 없습니다.' });
      res.status(200).json({ message: '댓글 수정 성공' });
    }
  );
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});

