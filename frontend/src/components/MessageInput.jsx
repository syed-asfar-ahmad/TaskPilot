import React, { useState, useRef, useEffect } from 'react';

const MessageInput = ({ chatId, onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!message.trim() || disabled) return;

    const messageText = message.trim();
    setMessage('');

    // Send message
    await onSendMessage(messageText);
    
    // Focus back to input without scrolling
    if (textareaRef.current) {
      textareaRef.current.focus({ preventScroll: true });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <div className="bg-white border-t border-green-200 p-4">
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={disabled}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed bg-gray-50 hover:bg-white transition-all duration-200 text-gray-800 placeholder-gray-500 leading-6"
            rows="1"
            style={{ height: '48px', maxHeight: '120px' }}
          />
        </div>
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:scale-105 active:scale-95 flex-shrink-0 ${
            message.trim() && !disabled
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
