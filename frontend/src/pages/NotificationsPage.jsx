import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Bell, Check, Trash2, ChevronLeft, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';
import AuthNavbar from '../components/AuthNavbar';
import Footer from '../components/Footer';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 20;
  const [showClearDialog, setShowClearDialog] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await fetchNotifications();
      await fetchUnreadCount();
      setLoading(false);
    };
    fetchAll();
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      toast.error('Failed to load notifications');
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${API}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.count);
    } catch (error) {
      // Silent error handling for unread count
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`${API}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(notif => notif._id === notificationId ? { ...notif, isRead: true } : notif));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await axios.patch(`${API}/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
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
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      const deletedNotif = notifications.find(n => n._id === notificationId);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    setShowClearDialog(false);
    try {
      await axios.delete(`${API}/notifications/clear-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error('Failed to clear notifications');
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TASK_CREATED':
      case 'PROJECT_CREATED':
        return <Bell size={20} className="text-green-600" />;
      case 'TASK_DELETED':
      case 'PROJECT_DELETED':
        return <Trash2 size={20} className="text-red-600" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
  };

  // Sort notifications by createdAt desc
  const sortedNotifications = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const totalPages = Math.ceil(sortedNotifications.length / perPage);
  const paginatedNotifications = sortedNotifications.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-100">
      <AuthNavbar />
      <main className="flex-1 w-full max-w-4xl mx-auto py-8 px-2 sm:px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 min-h-[50vh]">
            <div className="relative">
              <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Bell size={24} className="text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Loading Notifications</h3>
              <p className="text-gray-600 text-sm">Fetching your latest notifications...</p>
            </div>
            <div className="flex space-x-1 mt-3">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        ) : (
          <>
            {/* Consistent Header with Back Button and Centered Title */}
            {/* Mobile: Back button on its own line */}
            <div className="md:hidden mb-2">
              <button
                onClick={() => window.history.back()}
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
                  <Bell size={20} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                  Notifications
                </h1>
              </div>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                All your recent notifications in one place.
              </p>
            </div>
            {/* Desktop: Back button, title, description in a row */}
            <div className="hidden md:flex items-center justify-between mb-2">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 hover:shadow-lg transition-all duration-200 font-medium text-sm"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <div className="flex-1 flex flex-col items-center">
                <div className="inline-flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center">
                    <Bell size={20} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                    Notifications
                  </h1>
                </div>
                <p className="text-base text-gray-600 max-w-2xl mx-auto mt-1">
                  All your recent notifications in one place.
                </p>
              </div>
              <div className="w-20"></div> {/* Spacer to center the title */}
            </div>
            {/* Action Buttons: Mark all as read & Clear all */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4 mb-6">
              <button
                onClick={markAllAsRead}
                disabled={notifications.length === 0 || unreadCount === 0}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-md transition-colors text-sm
                  ${unreadCount === 0 || notifications.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'}`}
              >
                <Check size={16} /> Mark all as read
              </button>
              <button
                type="button"
                onClick={() => setShowClearDialog(true)}
                disabled={notifications.length === 0}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-md transition-colors text-sm
                  ${notifications.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'}`}
              >
                <Trash2 size={16} /> Clear all
              </button>
            </div>
            {notifications.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center min-h-[300px]">
                <div className="bg-white rounded-xl shadow-lg border border-green-100 p-8 text-center flex flex-col justify-center items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center shadow-lg mb-4">
                    <Bell size={36} className="text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-700 mb-2">No notifications yet</h2>
                  <p className="text-gray-500 text-base mb-2">You're all caught up! You'll see your notifications here when they arrive.</p>
                  <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mx-auto mt-2"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {paginatedNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className="bg-white rounded-lg shadow-md p-4 flex items-start gap-3"
                    >
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                        <p className="text-xs text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(notification.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                            title="Mark as read"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                          title="Delete notification"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination Controls - TaskListPage style */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, sortedNotifications.length)} of {sortedNotifications.length} notifications
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPage(page - 1)}
                          disabled={page === 1}
                          className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                            page === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          Previous
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => (
                            <button
                              key={pg}
                              onClick={() => setPage(pg)}
                              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                                page === pg
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {pg}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setPage(page + 1)}
                          disabled={page === totalPages}
                          className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                            page === totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
      <Footer />
      {/* Confirmation Dialog for Clear All */}
      {showClearDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Dialog Header */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Clear All Notifications</h3>
                <p className="text-sm text-gray-600">Confirm clearing all notifications</p>
              </div>
            </div>
            {/* Dialog Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to clear <span className="font-semibold text-red-600">all notifications</span>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800 mb-1">Warning</p>
                    <p className="text-sm text-red-700">
                      This action cannot be undone. All notifications will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Dialog Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowClearDialog(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-colors font-medium"
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

export default NotificationsPage;
