import React, { useState, useEffect, useRef } from 'react'; 
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import '../Styles/ChatBot.css';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

const FinSageChatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef(null);
  
    useEffect(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, [messages]);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!input.trim()) return;
  
      setMessages(prev => [...prev, { type: 'user', content: input }]);
      setInput('');
      setIsLoading(true);
  
      try {
        const response = await axios.post('https://3835-136-233-9-98.ngrok-free.app/query', {
          text: input
        });
        setTimeout(() => {
          setMessages(prev => [...prev, { type: 'bot', content: response.data.response }]);
          setIsLoading(false);
        }, 500); // Delay to show typing animation
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, { type: 'bot', content: 'Sorry, I encountered an error. Please try again.' }]);
        setIsLoading(false);
      }
    };
  
    return (
      <div className="finsage-container">
        <header className="finsage-header">
          <div className="finsage-auth">
            <button className="finsage-sign-in">Sign In</button>
            <AccountCircleOutlinedIcon style={{fontSize:"30px"}}></AccountCircleOutlinedIcon>
          </div>
        </header>
        <main className="finsage-main">
          <aside className="finsage-sidebar">
            <h1 className="finsage-logo">FinSage</h1>
            <p className="finsage-sidebar-text">Sign In to view your chat history</p>
          </aside>
          <section className="finsage-chat-section">
            {messages.length === 0 ? (
              <div className="finsage-welcome-message">
                <h2 className="gradient-text">
                  Personalized Financial<br />Guidance, Just a Chat Away!
                </h2>
              </div>
            ) : (
              <div ref={chatContainerRef} className="finsage-chat-container">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`finsage-message ${message.type === 'user' ? 'finsage-user-message' : 'finsage-bot-message'}`}
                  >
                    <div className="finsage-message-content">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="finsage-message finsage-bot-message">
                    <div className="finsage-message-content finsage-typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </div>
            )}
            <form onSubmit={handleSubmit} className="finsage-input-form">
              <div className="finsage-input-container">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask FinSage"
                  className="finsage-input"
                />
                <button type="submit" className="finsage-send-button" disabled={isLoading}>
                  <svg className="finsage-send-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    );
};

export default FinSageChatbot;
