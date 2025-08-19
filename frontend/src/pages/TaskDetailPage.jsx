import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/backButton';
import axios from 'axios';
import {
  FileText,
  MessageCircle,
  Paperclip,
  UploadCloud,
  Send,
  Pencil,
  Trash2,
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  User,
  ArrowRight,
  Download,
  Eye,
  File,
  Image,
  FileText as FileTextIcon,
  X,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import Navbar from '../components/AuthNavbar';
import Footer from '../components/Footer';
import { toast } from 'react-hot-toast';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [showDeleteAttachmentModal, setShowDeleteAttachmentModal] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const { token, user } = useAuth();
  const fileInputRef = useRef(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const statusOptions = ['To Do', 'In Progress', 'Completed'];
  // Add state for team member edit modal
  const [showTeamMemberEditModal, setShowTeamMemberEditModal] = useState(false);

  // Only allow if user is assigned Team Member
  const isAssignedTeamMember = user?.role === 'Team Member' && Array.isArray(task?.assignedTo) && task.assignedTo.some(u => (u?._id || u) === user?._id);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showStatusDropdown) return;
    const handler = (e) => setShowStatusDropdown(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [showStatusDropdown]);

  const fetchTaskDetails = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTask(res.data);
      setComments(res.data.comments || []);
    } catch (err) {
      toast.error("Failed to load task details");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isCommentSubmitting) return;

    setIsCommentSubmitting(true);
    try {
      const res = await axios.post(
        `${API}/tasks/${id}/comments`,
        { text: commentText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setComments([...comments, res.data]);
      setCommentText('');
      toast.success("Comment posted");
      
      // Refresh notifications immediately
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast.warn("Please select a file to upload");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large. Max size is 10MB");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);

    try {
      await axios.post(`${API}/tasks/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("File uploaded successfully");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchTaskDetails();
      
      // Refresh notifications immediately
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    } catch (err) {
      toast.error(`Upload failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/tasks/${task._id}/edit`);
  };

  const handleDelete = () => {
    setTaskToDelete(task);
    setShowDeleteTaskModal(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      await axios.delete(`${API}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Task deleted successfully!");
      navigate("/tasks");
      
      // Refresh notifications immediately
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    } catch (err) {
      toast.error("Failed to delete task");
    } finally {
      setShowDeleteTaskModal(false);
      setTaskToDelete(null);
    }
  };

  const cancelDeleteTask = () => {
    setShowDeleteTaskModal(false);
    setTaskToDelete(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'To Do':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckSquare className="w-5 h-5 text-green-500" />;
      case 'In Progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'To Do':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'svg':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'pdf':
        return <FileTextIcon className="w-5 h-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileTextIcon className="w-5 h-5 text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <FileTextIcon className="w-5 h-5 text-green-600" />;
      case 'txt':
        return <FileTextIcon className="w-5 h-5 text-gray-600" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const isPreviewable = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const previewableExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'pdf', 'txt'];
    return previewableExtensions.includes(extension);
  };

  const handleDownload = async (attachmentId) => {
    try {
      const attachment = task.attachments.find(a => a._id === attachmentId);
      if (!attachment) {
        toast.error("Attachment not found");
        return;
      }

      const response = await axios.get(`${API}/tasks/${id}/attachments/${attachmentId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      // Create blob with proper MIME type
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.filename || 'file');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("File downloaded successfully!");
      
      // Refresh notifications immediately
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    } catch (err) {
      toast.error("Failed to download file");
    }
  };

  const handlePreview = async (attachment) => {
    try {
      if (attachment.path.startsWith('http')) {
        // For Vercel Blob URLs, open directly
        window.open(attachment.path, '_blank');
      } else {
        // For local files, get the file first
        const response = await axios.get(`${API}/tasks/${id}/attachments/${attachment._id}/download`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        });

        // Create blob with proper MIME type
        const blob = new Blob([response.data], { 
          type: response.headers['content-type'] || 'application/octet-stream' 
        });
        
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Clean up URL after a delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      }
    } catch (err) {
      toast.error("Failed to preview file");
    }
  };

  const handleDeleteAttachment = (attachmentId) => {
    const attachment = task.attachments.find(a => a._id === attachmentId);
    setAttachmentToDelete({ id: attachmentId, filename: attachment?.filename || 'this file' });
    setShowDeleteAttachmentModal(true);
  };

  const confirmDeleteAttachment = async () => {
    if (!attachmentToDelete) return;
    
    try {
      await axios.delete(`${API}/tasks/${id}/attachments/${attachmentToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Attachment deleted successfully!");
      fetchTaskDetails();
      setShowDeleteAttachmentModal(false);
      setAttachmentToDelete(null);
      
      // Refresh notifications immediately
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    } catch (err) {
      toast.error("Failed to delete attachment");
    }
  };

  const cancelDeleteAttachment = () => {
    setShowDeleteAttachmentModal(false);
    setAttachmentToDelete(null);
  };

  const handleDeleteComment = (commentId) => {
    const comment = comments.find(c => c._id === commentId);
    setCommentToDelete({ id: commentId, text: comment?.text || 'this comment' });
    setShowDeleteCommentModal(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      await axios.delete(`${API}/tasks/${id}/comments/${commentToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Comment deleted successfully");
      fetchTaskDetails(); // Refresh task details to update comments
      setShowDeleteCommentModal(false);
      setCommentToDelete(null);
      
      // Refresh notifications immediately
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    } catch (err) {
      toast.error("Failed to delete comment");
    }
  };

  const cancelDeleteComment = () => {
    setShowDeleteCommentModal(false);
    setCommentToDelete(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto px-4 py-4 w-full">
          {/* Loading State */}
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative">
              {/* Spinning Circle */}
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              {/* Task Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckSquare size={18} className="text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Loading Task Details</h3>
              <p className="text-gray-600">Fetching task information...</p>
            </div>
            {/* Loading Dots */}
            <div className="flex space-x-2 mt-3">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto px-4 py-4 w-full">
          <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6 text-center">
            <CheckSquare size={48} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Task Not Found</h3>
            <p className="text-gray-600 mb-3">The task you're looking for doesn't exist or you don't have access to it.</p>
            <button 
              onClick={() => navigate("/tasks")} 
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <ArrowRight size={16} />
              Back to Tasks
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-4 w-full">
        {/* Header with Back Button and Title - Responsive */}
        <div className="mb-3">
          {/* Back Button - Top Row on Mobile */}
          <div className="mb-3 md:hidden">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 hover:shadow-lg transition-all duration-200 font-medium text-sm"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
          
          {/* Desktop Layout - Back Button and Title on Same Line */}
          <div className="hidden md:flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 hover:shadow-lg transition-all duration-200 font-medium text-sm"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center">
                <CheckSquare size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                Task Details
              </h1>
            </div>
            
            <div className="w-20"></div> {/* Spacer to center the title */}
          </div>
          
          {/* Mobile Layout - Centered Title */}
          <div className="md:hidden text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center">
                <CheckSquare size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                Task Details
              </h1>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-3">
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            View and manage task information
          </p>
        </div>
        
        {/* Task Header Card */}
        <div className="mb-3">
          <div className="bg-gradient-to-r from-white to-green-50 rounded-xl shadow-lg border border-green-200 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                <CheckSquare size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 break-words leading-tight mb-2">{task.title}</h2>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500 font-medium">Task Information</span>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)} shadow-sm`}>
                  {task.status}
                </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)} shadow-sm`}>
                  {task.priority}
                </span>
              </div>
            </div>
                <p className="text-gray-700 text-base leading-relaxed">{task.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Section with Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-4">
            {/* Task Info Cards */}
            <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={12} />
                </div>
                Task Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 relative">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    {getTaskStatusIcon(task.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Status</p>
                    <div className="flex items-center gap-2 relative">
                      <button
                        type="button"
                        className={`font-semibold px-3 py-1 rounded-full shadow-sm text-sm border border-green-200 flex items-center gap-1 transition-all duration-150 ${getStatusColor(task.status)}`}
                      >
                        {task.status}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="text-yellow-600" size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Priority</p>
                    <p className="font-semibold text-gray-800">{task.priority}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-blue-600" size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Due Date</p>
                    <p className="font-semibold text-gray-800">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="text-purple-600" size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Assigned To</p>
                    <p className="font-semibold text-gray-800">
                      {task.assignedTo?.[0]?.name || 'Unassigned'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-4">
             {/* Task Actions - For Managers */}
             {user?.role === "Manager" && (
               <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4">
                 <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                   <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                     <Pencil className="text-white" size={12} />
                   </div>
                   Manager Actions
                 </h2>
                 <div className="space-y-3 min-h-[60px] flex flex-col justify-center">
                   <button
                     onClick={() => navigate(`/tasks/${id}/edit`)}
                     className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                   >
                     <Pencil size={16} />
                     Edit Task
                   </button>
                 </div>
               </div>
             )}

             {/* Project Info */}
             {task.project && (
               <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4">
                 <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                   <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                     <FileText className="text-white" size={12} />
                   </div>
                   Project
                 </h2>
                 <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                   <p className="font-semibold text-gray-800 mb-1">{task.project.name}</p>
                   <p className="text-sm text-gray-600 leading-relaxed">{task.project.description}</p>
                 </div>
               </div>
             )}

             {isAssignedTeamMember && (
               <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4">
                 <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                   <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                     <CheckSquare className="text-white" size={12} />
                   </div>
                   Task Actions
                 </h2>
                 <div className="space-y-3 min-h-[60px] flex flex-col justify-center">
                   <button
                     onClick={() => navigate(`/tasks/${id}/edit`)}
                     className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                   >
                     <CheckSquare size={16} />
                     Update Status
                   </button>
                 </div>
               </div>
             )}
              </div>
            </div>

         {/* Full Width Sections */}
        <div className="space-y-4">
          {/* Attachments Section */}
            <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Paperclip className="text-white" size={12} />
                </div>
                Task Attachments ({task.attachments?.length || 0})
              </h2>
            
            {/* File Upload */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {file && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 mt-2">
                  <p className="text-sm text-green-700">Selected: {file.name}</p>
                </div>
              )}
              <button
                onClick={handleFileUpload}
                className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors mt-3 ${
                  uploading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={uploading}
              >
                <UploadCloud size={18} />
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>

            {/* Attachments List */}
            {!task.attachments || task.attachments.length === 0 ? (
              <div className="text-center py-6">
                <Paperclip size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No attachments uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                  {task.attachments.map((file, idx) => (
                  <div key={file._id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(file.filename)}
                        <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{file.filename}</p>
                        <p className="text-sm text-gray-500">
                            {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isPreviewable(file.filename) && (
                          <button
                            onClick={() => handlePreview(file)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Preview"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(file._id)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                        title="Download"
                        >
                          <Download size={16} />
                        </button>
                        {user?.role === 'Manager' && (
                          <button
                            onClick={() => handleDeleteAttachment(file._id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="text-white" size={12} />
                </div>
                Comments ({comments.length})
              </h2>
              {comments.length === 0 ? (
                <div className="text-center py-8 min-h-[180px] flex flex-col justify-center items-center">
                  <MessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {comments.map((c, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {c.author?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{c.author?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {user?.role === 'Manager' && (
                          <button
                            onClick={() => handleDeleteComment(c._id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all duration-200"
                            title="Delete comment"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 ml-10">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={isCommentSubmitting}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={isCommentSubmitting || !commentText.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Send size={16} /> {isCommentSubmitting ? 'Posting...' : 'Post'}
                </button>
              </form>
          </div>
        </div>
      </main>

      {/* Delete Attachment Modal */}
      {showDeleteAttachmentModal && attachmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Dialog Header */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete Attachment</h3>
                <p className="text-sm text-gray-600">Confirm file deletion</p>
              </div>
            </div>

            {/* Dialog Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-red-600">
                  "{attachmentToDelete.filename}"
                </span>?
              </p>
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                This action cannot be undone. The file will be permanently deleted.
              </p>
            </div>

            {/* Dialog Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={cancelDeleteAttachment}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAttachment}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-colors"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comment Modal */}
      {showDeleteCommentModal && commentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Dialog Header */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete Comment</h3>
                <p className="text-sm text-gray-600">Confirm comment deletion</p>
              </div>
            </div>

            {/* Dialog Content */}
                           <div className="p-6">
                 <p className="text-gray-700 mb-4">
                   Are you sure you want to delete this comment?
                 </p>
                 <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                   This action cannot be undone. The comment will be permanently deleted.
                 </p>
               </div>

            {/* Dialog Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={cancelDeleteComment}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteComment}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-colors"
              >
                Delete Comment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Modal */}
      {showDeleteTaskModal && taskToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Dialog Header */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete Task</h3>
                <p className="text-sm text-gray-600">Confirm task deletion</p>
              </div>
            </div>

            {/* Dialog Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-red-600">
                  "{taskToDelete.title}"
                </span>?
              </p>
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                This action cannot be undone. The task will be permanently deleted.
              </p>
            </div>

            {/* Dialog Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={cancelDeleteTask}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTask}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-colors"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Member Edit Modal */}
      {showTeamMemberEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300 scale-100">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-t-2xl p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Pencil size={24} className="text-white" />
                <h3 className="text-xl font-bold">Update Task Status</h3>
              </div>
              <button
                onClick={() => setShowTeamMemberEditModal(false)}
                className="bg-white bg-opacity-20 p-2 rounded-xl hover:bg-opacity-30 transition-all duration-200"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await axios.put(`${API}/tasks/${task._id}`, { status: pendingStatus || task.status }, { headers: { Authorization: `Bearer ${token}` } });
                  toast.success('Task status updated');
                  setShowTeamMemberEditModal(false);
                  fetchTaskDetails();
                } catch (err) {
                  toast.error('Failed to update status');
                }
              }}
              className="p-6 space-y-6"
            >
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Title</label>
                <input type="text" value={task.title} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-700" />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Description</label>
                <textarea value={task.description} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-700" rows={3} />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Due Date</label>
                <input type="text" value={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-700" />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Priority</label>
                <input type="text" value={task.priority} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-700" />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Status</label>
                <select
                  value={pendingStatus || task.status}
                  onChange={e => setPendingStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 bg-white"
                  required
                >
                  {statusOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTeamMemberEditModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default TaskDetailPage;
