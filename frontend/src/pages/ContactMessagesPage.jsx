import { useState, useEffect } from 'react';
import { Mail, Clock, CheckCircle, Eye, Trash2, Calendar, User, MessageSquare, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Navbar from '../components/AuthNavbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

export default function ContactMessagesPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [contactsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'https://taskpilot-o3bm.onrender.com/api'}/contact/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sort contacts by creation date (newest first)
      const sortedContacts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setContacts(sortedContacts);
    } catch (error) {
      toast.error('Failed to fetch contact messages');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${process.env.REACT_APP_API_BASE_URL || 'https://taskpilot-o3bm.onrender.com/api'}/contact/admin/${id}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchContacts(); // Refresh the list
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteContact = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL || 'https://taskpilot-o3bm.onrender.com/api'}/contact/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchContacts(); // Refresh the list
      toast.success('Message deleted successfully');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800';
      case 'read': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'unread': return <Mail size={16} />;
      case 'read': return <Eye size={16} />;
      case 'replied': return <CheckCircle size={16} />;
      default: return <Mail size={16} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pagination logic
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = contacts.slice(indexOfFirstContact, indexOfLastContact);
  const totalPages = Math.ceil(contacts.length / contactsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
        <Navbar />
        <main className={`${contacts.length === 0 ? 'max-w-4xl' : 'max-w-7xl'} mx-auto px-3 sm:px-6 lg:px-8 py-4 flex-grow`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                {/* Spinning Circle */}
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                {/* Message Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <MessageSquare size={20} className="text-green-600" />
                </div>
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Contact Messages</h3>
                <p className="text-gray-600 text-sm">Fetching your messages...</p>
              </div>
              {/* Loading Dots */}
              <div className="flex space-x-2 mt-3">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          ) : (
            <div className="mx-auto">
              {/* Back Button */}
              <div className="mb-4">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              </div>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center">
                    <MessageSquare size={20} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                    Contact Messages
                  </h1>
                </div>
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                  Manage and respond to customer inquiries and support requests
                </p>
              </div>

              {/* Statistics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-center hover:shadow-xl transition-shadow duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={20} className="text-white" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{contacts.length}</div>
                  <div className="text-xs text-gray-600 font-medium">Total Messages</div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-center hover:shadow-xl transition-shadow duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail size={20} className="text-white" />
                  </div>
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {contacts.filter(c => c.status === 'unread').length}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">Unread Messages</div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-center hover:shadow-xl transition-shadow duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={20} className="text-white" />
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {contacts.filter(c => c.status === 'replied').length}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">Replied Messages</div>
                </div>
              </div>

              {/* Messages List */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {contacts.length === 0 ? (
                  <div className="text-center py-12 min-h-[220px] flex flex-col justify-center items-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare size={32} className="sm:w-10 sm:h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">Contact form submissions will appear here</p>
                    <div className="w-12 h-1 sm:w-16 bg-green-600 rounded-full mx-auto"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    {/* Desktop Table */}
                    <table className="w-full hidden lg:table">
                      <thead className="bg-gradient-to-r from-gray-50 to-green-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <User size={16} className="text-green-600" />
                              <span>Sender</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <MessageSquare size={16} className="text-green-600" />
                              <span>Subject</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <CheckCircle size={16} className="text-green-600" />
                              <span>Status</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <Calendar size={16} className="text-green-600" />
                              <span>Date</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <Eye size={16} className="text-green-600" />
                              <span>Actions</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentContacts.map((contact) => (
                          <tr key={contact._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                  <User size={16} className="text-green-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                                  <div className="text-xs text-gray-500">{contact.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900 font-medium">{contact.subject}</div>
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {contact.message.substring(0, 50)}...
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                                {getStatusIcon(contact.status)}
                                <span className="ml-1 capitalize">{contact.status}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                              <div className="flex items-center">
                                <Calendar size={12} className="mr-1" />
                                {formatDate(contact.createdAt)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedContact(contact);
                                    setShowModal(true);
                                    if (contact.status === 'unread') {
                                      updateStatus(contact._id, 'read');
                                    }
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors hover:scale-105 transform duration-200 shadow-sm hover:shadow-md"
                                  title="View Message"
                                >
                                  <Eye size={16} />
                                </button>
                                <div className="relative">
                                  <select
                                    value={contact.status}
                                    onChange={(e) => updateStatus(contact._id, e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-xs font-medium text-gray-700 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                                  >
                                    <option value="unread" className="text-red-600">Unread</option>
                                    <option value="read" className="text-yellow-600">Read</option>
                                    <option value="replied" className="text-green-600">Replied</option>
                                  </select>
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteContact(contact._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors hover:scale-105 transform duration-200 shadow-sm hover:shadow-md"
                                  title="Delete Message"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mobile Cards */}
                    <div className="lg:hidden">
                      {currentContacts.map((contact) => (
                        <div key={contact._id} className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <User size={20} className="text-green-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                                <div className="text-xs text-gray-500">{contact.email}</div>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                              {getStatusIcon(contact.status)}
                              <span className="ml-1 capitalize">{contact.status}</span>
                            </span>
                          </div>
                          
                          <div className="mb-3">
                            <div className="text-sm font-medium text-gray-900 mb-1">{contact.subject}</div>
                            <div className="text-xs text-gray-500">
                              {contact.message.substring(0, 80)}...
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar size={12} className="mr-1" />
                              {formatDate(contact.createdAt)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedContact(contact);
                                  setShowModal(true);
                                  if (contact.status === 'unread') {
                                    updateStatus(contact._id, 'read');
                                  }
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors hover:scale-105 transform duration-200 shadow-sm hover:shadow-md"
                                title="View Message"
                              >
                                <Eye size={16} />
                              </button>
                              <div className="relative">
                                <select
                                  value={contact.status}
                                  onChange={(e) => updateStatus(contact._id, e.target.value)}
                                  className="appearance-none bg-white border border-gray-300 rounded-lg px-2 py-1 pr-6 text-xs font-medium text-gray-700 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                                >
                                  <option value="unread" className="text-red-600">Unread</option>
                                  <option value="read" className="text-yellow-600">Read</option>
                                  <option value="replied" className="text-green-600">Replied</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                              <button
                                onClick={() => deleteContact(contact._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors hover:scale-105 transform duration-200 shadow-sm hover:shadow-md"
                                title="Delete Message"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {contacts.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      Showing {indexOfFirstContact + 1} to {Math.min(indexOfLastContact, contacts.length)} of {contacts.length} messages
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        Previous
                      </button>
                    
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                              currentPage === pageNumber
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        ))}
                      </div>
                    
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                          currentPage === totalPages
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
            </div>
          )}
        </main>
        <Footer />
      </div>

      {/* Message Detail Modal */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 sm:p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <MessageSquare size={20} className="sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Message Details</h2>
                    <p className="text-green-100 text-xs sm:text-sm">View and manage this inquiry</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {/* Message Header */}
                <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-xl p-4 sm:p-6 border border-gray-100">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{selectedContact.subject}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="flex items-center space-x-3 bg-white rounded-xl p-3 shadow-sm min-w-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User size={14} className="sm:w-4 sm:h-4 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 font-medium">Sender</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{selectedContact.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white rounded-xl p-3 shadow-sm min-w-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail size={14} className="sm:w-4 sm:h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 font-medium">Email</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{selectedContact.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white rounded-xl p-3 shadow-sm min-w-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock size={14} className="sm:w-4 sm:h-4 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 font-medium">Date</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{formatDate(selectedContact.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Message Content */}
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                    <MessageSquare size={16} className="sm:w-5 sm:h-5 text-green-600 mr-2" />
                    Message Content
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6 text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                    {selectedContact.message}
                  </div>
                </div>
                
                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 sm:pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(selectedContact.status)}`}>
                      {getStatusIcon(selectedContact.status)}
                      <span className="ml-1 sm:ml-2 capitalize">{selectedContact.status}</span>
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      ID: {selectedContact._id.slice(-8)}
                    </span>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-sm sm:text-base"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 