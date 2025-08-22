import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, Eye, FileText, Edit, CheckCircle, Trash, FolderOpen, FileEdit, PartyPopper, Zap, MessageSquare, Paperclip, UserPlus, UserMinus, Users, UserCheck, AlertTriangle, Mail } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_BASE_URL || 'https://taskpilot-1-mzxb.onrender.com/api';

function NotificationBell() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const clearAllButtonRef = useRef();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Poll for new notifications every 5 seconds (reduced from 30)
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 5000);

    // Listen for refresh events from other components
    const handleRefresh = () => {
      refreshNotifications();
    };
    window.addEventListener('refreshNotifications', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshNotifications', handleRefresh);
    };
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      // Error handling without console logging
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${API}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.count);
    } catch (error) {
      // Error handling without console logging
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`${API}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      // Error handling without console logging
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await axios.patch(`${API}/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      // Error handling without console logging
      toast.error('Failed to mark all notifications as read');
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${API}/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.filter(notif => notif._id !== notificationId)
      );
      
      const deletedNotif = notifications.find(n => n._id === notificationId);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification deleted');
    } catch (error) {
      // Error handling without console logging
      toast.error('Failed to delete notification');
    }
  };

  const clearAllNotifications = async () => {
    try {
      // Delete all notifications from backend
      await axios.delete(`${API}/notifications/clear-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Clear local state
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
    } catch (error) {
      // Error handling without console logging
      toast.error('Failed to clear notifications');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TASK_CREATED':
        return <FileText size={20} className="text-green-600" />;
      case 'TASK_UPDATED':
        return <Edit size={20} className="text-yellow-600" />;
      case 'TASK_COMPLETED':
        return <CheckCircle size={20} className="text-blue-600" />;
      case 'TASK_DELETED':
        return <Trash size={20} className="text-red-600" />;
      case 'PROJECT_CREATED':
        return <FolderOpen size={20} className="text-green-600" />;
      case 'PROJECT_UPDATED':
        return <FileEdit size={20} className="text-yellow-600" />;
      case 'PROJECT_COMPLETED':
        return <PartyPopper size={20} className="text-blue-600" />;
      case 'PROJECT_DELETED':
        return <Zap size={20} className="text-red-600" />;
      case 'COMMENT_ADDED':
        return <MessageSquare size={20} className="text-purple-600" />;
      case 'COMMENT_DELETED':
        return <Trash size={20} className="text-red-600" />;
      case 'ATTACHMENT_ADDED':
        return <Paperclip size={20} className="text-green-600" />;
      case 'ATTACHMENT_DELETED':
        return <Trash size={20} className="text-red-600" />;
      case 'PROFILE_UPDATED':
        return <Edit size={20} className="text-blue-600" />;
      case 'MEMBER_ADDED':
        return <UserPlus size={20} className="text-green-600" />;
      case 'MEMBER_REMOVED':
        return <UserMinus size={20} className="text-red-600" />;
      case 'TEAM_CREATED':
        return <Users size={20} className="text-blue-600" />;
      case 'TEAM_MEMBER_JOINED':
        return <UserCheck size={20} className="text-green-600" />;
      case 'PROJECT_DELETED_BY_MANAGER':
        return <AlertTriangle size={20} className="text-orange-600" />;
      case 'NEW_USER_SIGNUP':
        return <UserPlus size={20} className="text-purple-600" />;
      case 'CONTACT_FORM_SUBMITTED':
        return <Mail size={20} className="text-orange-600" />;
      case 'NEW_MESSAGE':
        return <MessageSquare size={20} className="text-green-600" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'TASK_CREATED':
      case 'PROJECT_CREATED':
      case 'ATTACHMENT_ADDED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'TASK_DELETED':
      case 'PROJECT_DELETED':
      case 'COMMENT_DELETED':
      case 'ATTACHMENT_DELETED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'TASK_COMPLETED':
      case 'PROJECT_COMPLETED':
      case 'PROFILE_UPDATED':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'TASK_UPDATED':
      case 'PROJECT_UPDATED':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'COMMENT_ADDED':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'MEMBER_ADDED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'MEMBER_REMOVED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'TEAM_CREATED':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'TEAM_MEMBER_JOINED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'PROJECT_DELETED_BY_MANAGER':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'NEW_USER_SIGNUP':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'CONTACT_FORM_SUBMITTED':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'NEW_MESSAGE':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getNotificationBadge = (type) => {
    switch (type) {
      case 'TASK_CREATED':
      case 'PROJECT_CREATED':
      case 'ATTACHMENT_ADDED':
        return 'bg-green-100 text-green-800';
      case 'TASK_DELETED':
      case 'PROJECT_DELETED':
      case 'COMMENT_DELETED':
      case 'ATTACHMENT_DELETED':
        return 'bg-red-100 text-red-800';
      case 'TASK_COMPLETED':
      case 'PROJECT_COMPLETED':
      case 'PROFILE_UPDATED':
        return 'bg-blue-100 text-blue-800';
      case 'TASK_UPDATED':
      case 'PROJECT_UPDATED':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMMENT_ADDED':
        return 'bg-purple-100 text-purple-800';
      case 'MEMBER_ADDED':
        return 'bg-green-100 text-green-800';
      case 'MEMBER_REMOVED':
        return 'bg-red-100 text-red-800';
      case 'TEAM_CREATED':
        return 'bg-blue-100 text-blue-800';
      case 'TEAM_MEMBER_JOINED':
        return 'bg-green-100 text-green-800';
      case 'PROJECT_DELETED_BY_MANAGER':
        return 'bg-orange-100 text-orange-800';
      case 'NEW_USER_SIGNUP':
        return 'bg-purple-100 text-purple-800';
      case 'CONTACT_FORM_SUBMITTED':
        return 'bg-orange-100 text-orange-800';
      case 'NEW_MESSAGE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications(); // Fetch fresh notifications when opening
      fetchUnreadCount(); // Also fetch unread count
    }
    setIsOpen(!isOpen);
  };

  // Function to refresh notifications immediately
  const refreshNotifications = () => {
    fetchNotifications();
    fetchUnreadCount();
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Handle different notification types
    switch (notification.type) {
      case 'CONTACT_FORM_SUBMITTED':
        navigate('/contact-messages');
        break;
      case 'TASK_CREATED':
      case 'TASK_UPDATED':
      case 'TASK_COMPLETED':
      case 'TASK_DELETED':
        if (notification.relatedTask) {
          navigate(`/tasks/${notification.relatedTask}`);
        } else {
          navigate('/tasks');
        }
        break;
      case 'PROJECT_CREATED':
      case 'PROJECT_UPDATED':
      case 'PROJECT_COMPLETED':
      case 'PROJECT_DELETED':
      case 'PROJECT_DELETED_BY_MANAGER':
        if (notification.relatedProject) {
          navigate(`/projects/${notification.relatedProject}`);
        } else {
          navigate('/projects');
        }
        break;
      case 'NEW_USER_SIGNUP':
        navigate('/users');
        break;
      case 'MEMBER_ADDED':
      case 'MEMBER_REMOVED':
      case 'TEAM_MEMBER_JOINED':
        navigate('/team-members');
        break;
      case 'TEAM_CREATED':
        navigate('/teams');
        break;
      case 'COMMENT_ADDED':
      case 'COMMENT_DELETED':
        if (notification.relatedTask) {
          navigate(`/tasks/${notification.relatedTask}`);
        } else if (notification.relatedProject) {
          navigate(`/projects/${notification.relatedProject}`);
        } else {
          navigate('/tasks');
        }
        break;
      case 'ATTACHMENT_ADDED':
      case 'ATTACHMENT_DELETED':
        if (notification.relatedTask) {
          navigate(`/tasks/${notification.relatedTask}`);
        } else if (notification.relatedProject) {
          navigate(`/projects/${notification.relatedProject}`);
        } else {
          navigate('/tasks');
        }
        break;
      case 'PROFILE_UPDATED':
        navigate('/profile');
        break;
      case 'NEW_MESSAGE':
        if (notification.relatedChat) {
          navigate('/chat');
        } else {
          navigate('/chat');
        }
        break;
      default:
        // For other notifications, just close the dropdown
        break;
    }
    
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-white hover:text-white/80 hover:bg-white/10 rounded-lg transition-all duration-200 group"
      >
        <Bell size={20} className="transition-transform group-hover:scale-110" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="fixed left-1/2 top-20 -translate-x-1/2 z-50 w-[95vw] max-w-sm sm:w-[350px] md:w-[450px] max-h-[500px] overflow-hidden overflow-x-auto bg-white rounded-xl shadow-2xl border border-gray-200
          md:absolute md:right-0 md:left-auto md:top-auto md:mt-3 md:translate-x-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center space-x-2">
              <Bell size={20} className="text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-xs text-green-600 hover:text-green-700 font-medium disabled:opacity-50 px-2 py-1 rounded-md hover:bg-green-50 transition-colors"
                >
                  {loading ? 'Marking...' : 'Mark all read'}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bell size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-600 font-medium">No notifications yet</p>
                <p className="text-sm text-gray-400 mt-1">You'll see notifications here when they arrive</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${
                    !notification.isRead ? 'bg-blue-50/50 border-l-4 border-blue-400' : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-sm font-semibold text-gray-800 truncate">
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification._id);
                              }}
                              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded transition-colors"
                              title="Mark as read"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification._id);
                            }}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-end">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="font-medium">
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-xs">{unreadCount} unread</span>
                  </span>
                  <button
                    onClick={() => setShowClearAllConfirm(true)}
                    className="text-red-600 hover:text-red-700 font-medium text-xs hover:underline"
                    ref={clearAllButtonRef}
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Confirmation Dialog for Clear All */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={e => { if (e.target === e.currentTarget) setShowClearAllConfirm(false); }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Dialog Header */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Clear All Notifications</h3>
                <p className="text-sm text-gray-600">Are you sure you want to clear all notifications?</p>
              </div>
            </div>
            {/* Dialog Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                This will permanently delete all your notifications. This action cannot be undone.
              </p>
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                Warning: You will not be able to recover any cleared notifications.
              </p>
            </div>
            {/* Dialog Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowClearAllConfirm(false);
                  await clearAllNotifications();
                }}
                className="flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
