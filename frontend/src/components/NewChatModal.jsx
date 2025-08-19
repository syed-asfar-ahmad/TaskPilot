import React, { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const NewChatModal = ({ isOpen, onClose, onChatCreated, chats = [] }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchAvailableUsers();
    }
  }, [isOpen]);

  const fetchAvailableUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatService.getAvailableUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to load users');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (participantId) => {
    try {
      const chat = await chatService.createOrGetChat(participantId);
      onChatCreated(chat);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to start chat');
      toast.error('Failed to start chat');
    }
  };

  // Get all user IDs already in chat list (excluding self)
  const chatUserIds = new Set();
  chats.forEach(chat => {
    if (Array.isArray(chat.participants)) {
      chat.participants.forEach(p => {
        if (p._id && p._id !== user._id) {
          chatUserIds.add(p._id);
        }
      });
    }
  });

  // Filter users: not in chatUserIds and matches search
  const filteredUsers = users.filter(u =>
    !chatUserIds.has(u._id) &&
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">New Chat</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Users List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchAvailableUsers}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Retry
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-gray-500">
                {searchTerm ? 'No users found' : 'No available users'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((userItem) => (
                <div
                  key={userItem._id}
                  onClick={() => handleStartChat(userItem._id)}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex-shrink-0">
                    {userItem.profilePicture ? (
                      <img
                        src={userItem.profilePicture}
                        alt={userItem.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {userItem.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {userItem.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {userItem.email}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {userItem.role}
                    </p>
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
