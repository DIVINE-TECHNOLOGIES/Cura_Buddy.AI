"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface Message {
  type: 'user' | 'ai';
  text: string;
  image?: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const appendMessage = (type: 'user' | 'ai', text: string, image?: string) => {
    setMessages(prev => [...prev, { type, text, image }]);
  };

  const formatMessage = (text: string): string => {
    // Convert markdown-style formatting to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '•')
      .replace(/\n/g, '<br />');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    appendMessage('user', userMessage);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      setIsTyping(false);
      appendMessage('ai', data.response);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsTyping(false);
      setError('Sorry, I encountered an error. Please try again.');
      appendMessage('ai', "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment, or use the Symptom Checker for immediate assistance.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageSrc = event.target?.result as string;
        appendMessage('user', 'Uploaded an image for analysis.', imageSrc);
        setIsTyping(true);
        
        // Simulate image analysis
        setTimeout(async () => {
          try {
            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: 'I uploaded an image showing symptoms. Can you help analyze it?',
                conversationHistory: [],
              }),
            });

            if (response.ok) {
              const data = await response.json();
              setIsTyping(false);
              appendMessage('ai', data.response);
            } else {
              throw new Error('Failed to analyze image');
            }
          } catch {
            setIsTyping(false);
            appendMessage('ai', "I've received your image. Based on the symptoms you described, I recommend consulting a healthcare professional for accurate diagnosis. For general health advice: Stay hydrated, eat balanced meals, exercise regularly, and get enough sleep.");
          }
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const t = useTranslations('chatbot');

  return (
    <section className="chatbot-section">
      <div className="section-header">
        <h2>{t('title')}</h2>
        <p className="section-subtitle">Powered by advanced AI for intelligent health assistance</p>
      </div>
      <div className="chatbot-container">
        <div className="robo-avatar">
          <div className="avatar-glow"></div>
          <span className="avatar-icon">🤖</span>
          <span className="avatar-medical">🩺</span>
        </div>
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <div className="welcome-icon">👋</div>
              <div className="welcome-text">{t('greeting')}</div>
              <div className="welcome-hint">Ask me about symptoms, health advice, or medications</div>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.type}-message-wrapper`}>
              <div className={`message ${msg.type}-message`}>
                {msg.image && (
                  <div className="message-image">
                    <Image src={msg.image} alt="Uploaded" width={200} height={200} />
                  </div>
                )}
                <div 
                  className="message-content"
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                />
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-container">
          <div className="input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('placeholder')}
              disabled={isTyping}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button 
              onClick={handleFileUpload} 
              className="icon-button"
              title="Upload Image"
              disabled={isTyping}
            >
              📎
            </button>
          </div>
          <button 
            onClick={handleSend} 
            className="send-button"
            disabled={isTyping || !input.trim()}
          >
            {isTyping ? '...' : t('send')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Chatbot;
