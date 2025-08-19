import React, { useState, useEffect } from 'react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import NewChatModal from '../components/NewChatModal';
import { useSocket } from '../context/SocketContext';
import AuthNavbar from '../components/AuthNavbar';
import Footer from '../components/Footer';
import { CheckSquare, ArrowLeft, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const { isConnected } = useSocket();
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [chatListError, setChatListError] = useState(null);
  const navigate = useNavigate();

  // Fetch chats on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchChats() {
      setLoading(true);
      setChatListError(null);
      try {
        const data = await require('../services/chatService').chatService.getUserChats();
        if (isMounted) {
          setChats(data);
        }
      } catch (err) {
        if (isMounted) {
          setChatListError(err.message || 'Failed to load chats');
          toast.error('Failed to load chats');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchChats();
    return () => { isMounted = false; };
  }, []);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  const handleNewChatCreated = (chat) => {
    setSelectedChat(chat);
    setChats(prevChats => {
      if (!prevChats.some(c => c.chatId === chat.chatId)) {
        return [chat, ...prevChats];
      }
      return prevChats;
    });
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  const handleChatDeleted = (deletedChatId) => {
    // Clear the selected chat if it was the one that was deleted
    if (selectedChat && selectedChat.chatId === deletedChatId) {
      setSelectedChat(null);
    }
    setChats(prevChats => prevChats.filter(chat => chat.chatId !== deletedChatId));
  };

  const handleMessageSent = (message, chatId) => {
    setChats(prevChats => prevChats.map(chat =>
      chat.chatId === chatId
        ? { ...chat, lastMessage: {
            text: message.content,
            sender: message.sender,
            timestamp: message.createdAt || new Date().toISOString(),
          } }
        : chat
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col">
      {/* Navbar */}
      <AuthNavbar />
      {/* Page Header */}
      {!loading && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6 mb-2">
          {/* Mobile: Back button on its own line */}
          <div className="md:hidden mb-2">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 hover:shadow-lg transition-all duration-200 font-medium text-sm"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
          {/* Mobile: Title and description center aligned */}
          <div className="md:hidden flex flex-col items-center justify-center mb-2">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center">
                <MessageCircle size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                Chat
              </h1>
            </div>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Stay connected with your team and manage all your conversations in one place.
            </p>
          </div>
          {/* Desktop: Back button, title, description in a row */}
          <div className="hidden md:flex items-center justify-between mb-2">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 hover:shadow-lg transition-all duration-200 font-medium text-sm"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="flex-1 flex flex-col items-center">
              <div className="inline-flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                  Chat
                </h1>
              </div>
              <p className="text-base text-gray-600 max-w-2xl mx-auto mt-1">
                Stay connected with your team and manage all your conversations in one place.
              </p>
            </div>
            <div className="w-20"></div> {/* Spacer to center the title */}
          </div>
        </div>
      )}
      {/* Main Chat Container or Loader */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-14 h-14 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckSquare size={20} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Chats</h3>
            <p className="text-gray-600 text-sm">Fetching your conversations...</p>
          </div>
          <div className="flex space-x-2 mt-3">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-green-200/50 h-[calc(100vh-200px)]">
            {chatListError ? (
              <div className="flex flex-col items-center justify-center py-16 h-full">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium mb-2">Failed to load chats</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="flex h-full">
                {/* Chat List Sidebar */}
                <div className={`${selectedChat ? 'hidden lg:block' : 'block'} w-full lg:w-96 bg-gradient-to-br from-green-50 via-white to-emerald-50 border-r border-green-200/50 flex flex-col`}>
                  {/* Chat List Header */}
                  <div className="p-6 border-b border-green-200/50 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      }}></div>
                    </div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">Messages</h2>
                          <p className="text-green-100 text-sm">Stay connected with your team</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowNewChatModal(true)}
                        className="p-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-green-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Chat List */}
                  <div className="flex-1 overflow-y-auto">
                    <ChatList
                      onChatSelect={handleChatSelect}
                      selectedChatId={selectedChat?.chatId}
                      onChatDeleted={handleChatDeleted}
                      chats={chats}
                      loading={false}
                    />
                  </div>
                </div>

                {/* Chat Window */}
                <div className={`${selectedChat ? 'block' : 'hidden lg:block'} flex-1 flex flex-col bg-gradient-to-br from-gray-50 via-white to-green-50`}>
                  <ChatWindow
                    selectedChat={selectedChat}
                    onBack={handleBack}
                    onMessageSent={handleMessageSent}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Footer */}
      <Footer />
      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={handleNewChatCreated}
        chats={chats}
      />
    </div>
  );
};

export default ChatPage;
