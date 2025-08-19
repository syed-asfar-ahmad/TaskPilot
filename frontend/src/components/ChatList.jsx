import React, { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ChatList = ({ onChatSelect, selectedChatId, onChatDeleted, chats = [], loading = false }) => {
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('new_message', (data) => {
      // Optionally, you can notify parent or refresh, but do not call setChats here
      // If you want to update UI, lift state to parent
    });

    return () => {
      socket.off('new_message');
    };
  }, [socket]);

  const handleDeleteClick = (e, chat) => {
    e.stopPropagation();
    setChatToDelete(chat);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!chatToDelete) return;
    
    try {
      setDeleting(true);
      await chatService.deleteChat(chatToDelete.chatId);
      
      // Notify parent component if the deleted chat was selected
      if (onChatDeleted && selectedChatId === chatToDelete.chatId) {
        onChatDeleted(chatToDelete.chatId);
      }
      
      // Close modal
      setShowDeleteModal(false);
      setChatToDelete(null);
      
      toast.success('Chat deleted successfully');
    } catch (err) {
      toast.error('Failed to delete chat. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setChatToDelete(null);
  };

  const getChatName = (chat) => {
    if (chat.chatType === 'team' && chat.teamId) {
      return chat.teamId.name || 'Team Chat';
    }
    
    const otherParticipants = chat.participants.filter(
      participant => participant._id !== user._id
    );
    
    if (otherParticipants.length === 1) {
      return otherParticipants[0].name;
    }
    
    return otherParticipants.map(p => p.name).join(', ');
  };

  const getChatAvatar = (chat) => {
    if (chat.chatType === 'team' && chat.teamId) {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white/20">
          {chat.teamId.name?.charAt(0).toUpperCase() || 'T'}
        </div>
      );
    }
    
    const otherParticipants = chat.participants.filter(
      participant => participant._id !== user._id
    );
    
    if (otherParticipants.length === 1) {
      const participant = otherParticipants[0];
      if (participant.profilePicture) {
        return (
          <img
            src={participant.profilePicture}
            alt={participant.name}
            className="w-12 h-12 rounded-2xl object-cover shadow-lg border-2 border-green-200/50"
          />
        );
      }
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white/20">
          {participant.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      );
    }
    
    return (
      <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white/20">
        G
      </div>
    );
  };

  const getLastMessagePreview = (chat) => {
    if (!chat.lastMessage) {
      return 'No messages yet';
    }
    
    const isOwnMessage = chat.lastMessage.sender === user._id;
    const prefix = isOwnMessage ? 'You: ' : '';
    
    return prefix + (chat.lastMessage.text || 'No messages yet');
  };

  const getLastMessageTime = (chat) => {
    if (!chat.lastMessage?.timestamp) {
      return '';
    }
    
    try {
      return formatDistanceToNow(new Date(chat.lastMessage.timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  const isOnline = (chat) => {
    // This would be implemented with socket.io online status
    return false;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-2">Failed to load chats</p>
        </div>
      </div>
    );
  }

  if (!chats || chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-500 text-sm mb-4">Start a new chat to connect with your team</p>
          <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4 max-h-[80vh] overflow-y-auto">
      {chats.map((chat) => (
        <div
          key={chat.chatId}
          onClick={() => onChatSelect(chat)}
          className={`group cursor-pointer rounded-2xl p-4 transition-all duration-300 hover:bg-white/80 hover:shadow-lg transform hover:scale-[1.02] relative ${
            selectedChatId === chat.chatId
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 shadow-xl scale-[1.02]'
              : 'hover:border-green-200/50 border-2 border-transparent'
          }`}
        >
          <div className="flex items-center space-x-4">
            {/* Avatar with online indicator */}
            <div className="relative">
              {getChatAvatar(chat)}
              {isOnline(chat) && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-lg"></div>
              )}
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 truncate">
                  {getChatName(chat)}
                </h3>
                <span className="text-xs text-gray-500 font-medium">
                  {getLastMessageTime(chat)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 truncate mt-1">
                {getLastMessagePreview(chat)}
              </p>
              
              {/* Chat type indicator and delete button */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  {chat.chatType === 'team' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200/50">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Team
                    </span>
                  )}
                </div>
                
                {/* Delete Button - Shows on hover */}
                <button
                  onClick={(e) => handleDeleteClick(e, chat)}
                  className="p-1.5 bg-red-500 text-white rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110"
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Delete Confirmation Modal - Same design as other pages */}
      {showDeleteModal && chatToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Dialog Header */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete Chat</h3>
                <p className="text-sm text-gray-600">Confirm chat deletion</p>
              </div>
            </div>
            {/* Dialog Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the chat{' '}
                <span className="font-semibold text-red-600">"{getChatName(chatToDelete)}"</span>?
              </p>
              <p className="text-sm text-gray-500 bg-red-50 p-3 rounded-lg border border-red-100">
                <span className="font-semibold text-red-700">Warning:</span> This action cannot be undone. All chat messages will be permanently deleted.
              </p>
            </div>
            {/* Dialog Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Chat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
