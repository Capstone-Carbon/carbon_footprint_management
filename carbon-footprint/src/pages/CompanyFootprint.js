import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './../sub_css/Company.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>탄소발자국</h2>
      <ul>
        <li>
          <Link to="/personal">개인 탄소 배출량</Link>
        </li>
        <li>
          <Link to="/company" style={{ color: '#4CAF50' }}>
            탄소 챗봇
          </Link>
        </li>
        <li>
          <Link to="/scenario">탄소 절감 시뮬레이션</Link>
        </li>
      </ul>
    </div>
  );
};

const CompanyCarbonFootprint = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendToGPT = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/chatbot_gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { from: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: '❌ 오류가 발생했습니다.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="footprint_container">
      <Sidebar />
      <div className="main-content">
        <h2>탄소 챗봇</h2>
        <div className="chat-window">
          <div
            style={{
              height: '300px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: '10px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  textAlign: m.from === 'user' ? 'right' : 'left',
                  marginBottom: '10px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    maxWidth: '70%',
                    padding: '8px 12px',
                    borderRadius: '16px',
                    backgroundColor: m.from === 'user' ? '#e0f7fa' : '#e8f5e9',
                    color: '#333',
                  }}
                >
                  <strong>{m.from === 'user' ? ' 나' : '탄소 챗봇'}:</strong>{' '}
                  {m.text}
                </span>
              </div>
            ))}
            {loading && (
              <div style={{ textAlign: 'left', marginBottom: '10px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    maxWidth: '70%',
                    padding: '8px 12px',
                    borderRadius: '16px',
                    backgroundColor: '#f0f0f0',
                    color: '#666',
                  }}
                >
                  탄소 챗봇: 응답 중...
                </span>
              </div>
            )}
          </div>
          <div style={{ marginTop: '10px', display: 'flex' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendToGPT()}
              placeholder="탄소 챗봇에게 물어보세요!"
              style={{ flex: 1, padding: '8px', fontSize: '14px' }}
            />
            <button
              onClick={sendToGPT}
              style={{
                marginLeft: '10px',
                padding: '8px 12px',
                fontSize: '14px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCarbonFootprint;
