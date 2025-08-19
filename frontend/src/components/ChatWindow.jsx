import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import MessageInput from './MessageInput';

const ChatWindow = ({ selectedChat, onBack, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const { socket, joinChat, leaveChat, isConnected } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      joinChat(selectedChat.chatId);
    }

    return () => {
      if (selectedChat) {
        leaveChat(selectedChat.chatId);
      }
    };
  }, [selectedChat]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (data) => {
      if (data.chatId === selectedChat?.chatId) {
        // Only add message if it's from another user (not the current user)
        const isOwnMessage = data.message.sender === user._id || 
                            data.message.sender?._id === user._id ||
                            data.message.sender === user.id ||
                            data.message.sender?._id === user.id;
        
        if (!isOwnMessage) {
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const messageExists = prev.some(m => m._id === data.message._id);
            if (!messageExists) {
              return [...prev, data.message];
            }
            return prev;
          });
        }
      }
    });

    socket.on('typing_start', (data) => {
      if (data.chatId === selectedChat?.chatId && data.userId !== user._id) {
        setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
      }
    });

    socket.on('typing_stop', (data) => {
      if (data.chatId === selectedChat?.chatId) {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('typing_start');
      socket.off('typing_stop');
    };
  }, [socket, selectedChat, user._id]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await chatService.getChatMessages(selectedChat.chatId);
      // Ensure messages is always an array
      const messagesData = Array.isArray(response) ? response : (response.messages || []);
      setMessages(messagesData);
    } catch (err) {
      setError(err.message || 'Failed to load messages');
      setMessages([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content) => {
    try {
      const message = await chatService.sendMessage(selectedChat.chatId, content);
      
      // Always add message to state immediately for instant feedback
      setMessages(prev => {
        return [...prev, message];
      });
      
      // Scroll to bottom after sending message
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);

      if (onMessageSent) {
        onMessageSent(message, selectedChat.chatId);
      }
    } catch (err) {
      // Error handling without console logging
    }
  };

  const getChatName = () => {
    if (selectedChat.chatType === 'team' && selectedChat.teamId) {
      return selectedChat.teamId.name || 'Team Chat';
    }
    
    const otherParticipants = selectedChat.participants.filter(
      participant => participant._id !== user._id
    );
    
    if (otherParticipants.length === 1) {
      return otherParticipants[0].name;
    }
    
    return otherParticipants.map(p => p.name).join(', ');
  };

  const getChatAvatar = () => {
    if (selectedChat.chatType === 'team' && selectedChat.teamId) {
      return (
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
          {selectedChat.teamId.name?.charAt(0).toUpperCase() || 'T'}
        </div>
      );
    }
    
    const otherParticipants = selectedChat.participants.filter(
      participant => participant._id !== user._id
    );
    
    if (otherParticipants.length === 1) {
      const participant = otherParticipants[0];
      if (participant.profilePicture) {
        return (
          <img
            src={participant.profilePicture}
            alt={participant.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        );
      }
      return (
        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
          {participant.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      );
    }
    
    return (
      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
        G
      </div>
    );
  };

  const formatMessageTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-full">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Select a chat</h3>
          <p className="text-sm text-gray-600">Choose a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-green-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Back button for mobile */}
            <button
              onClick={onBack}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Chat Avatar */}
            {getChatAvatar()}
            
            {/* Chat Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{getChatName()}</h2>
              <div className="flex items-center space-x-2">
                {selectedChat.chatType === 'team' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Team Chat
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-gradient-to-b from-gray-50 to-white min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading messages...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium mb-2">Failed to load messages</p>
              <button
                onClick={fetchMessages}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-500 text-sm mb-4">Start the conversation by sending a message</p>
              <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto"></div>
            </div>
          </div>
        ) : (
          <div ref={messagesContainerRef} className="overflow-y-auto p-4 h-full">
            <div className="space-y-4">
            {Array.isArray(messages) && messages.map((message) => {
              // Improved comparison to handle different ID formats
              const isOwnMessage = message.sender === user._id || 
                                  message.sender?._id === user._id ||
                                  message.sender === user.id ||
                                  message.sender?._id === user.id;
              
              const sender = selectedChat.participants.find(p => 
                p._id === message.sender || 
                p._id === message.sender?._id ||
                p.id === message.sender ||
                p.id === message.sender?._id
              );
              
              return (
                <div
                  key={message._id}
                  className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {isOwnMessage ? (
                    // Sent message - Right side
                    <div className="flex items-end space-x-2 max-w-xs lg:max-w-md xl:max-w-lg">
                      {/* Message Bubble */}
                      <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg max-w-full">
                        <p className="text-sm font-medium break-words">{message.content}</p>
                        <p className="text-xs mt-1 text-green-100 opacity-80">
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border-2 border-green-200"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-green-200">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Received message - Left side
                    <div className="flex items-end space-x-2 max-w-xs lg:max-w-md xl:max-w-lg">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {sender?.profilePicture ? (
                          <img
                            src={sender.profilePicture}
                            alt={sender.name}
                            className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-gray-200">
                            {sender?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      {/* Message Bubble */}
                      <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-800 shadow-sm max-w-full">
                        <p className="text-sm font-medium break-words">{message.content}</p>
                        <p className="text-xs mt-1 text-gray-500">
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-green-200 p-3 flex-shrink-0">
        <MessageInput onSendMessage={handleSendMessage} chatId={selectedChat.chatId} />
      </div>
    </div>
  );
};

export default ChatWindow;