import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/AuthNavbar";
import BackButton from "../components/backButton";
import Footer from "../components/Footer";
import {
  CalendarDays,
  Users,
  ClipboardList,
  MessageCircle,
  Pencil,
  Trash2,
  Edit3,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  UploadCloud,
  Download,
  Eye,
  FileText,
  Image,
  File,
  X,
  Send,
} from "lucide-react";
import { toast } from "react-hot-toast";

const API = process.env.REACT_APP_API_BASE_URL || 'https://taskpilot-1-mzxb.onrender.com/api';

function ProjectDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [showDeleteAttachmentModal, setShowDeleteAttachmentModal] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const fileInputRef = useRef(null);

  const fetchProject = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(res.data);
    } catch (err) {
      toast.error("Failed to fetch project details");
    }
  }, [id, token]);

  const fetchTasks = useCallback(async () => {
    try {
      let url;
      if (user?.role === "Team Member") {
        url = `${API}/tasks/project/${id}/user`;
      } else if (user?.role === "Manager") {
        url = `${API}/tasks/manager-project/${id}`;
      } else {
        url = `${API}/tasks?projectId=${id}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      toast.error("Failed to fetch tasks");
    }
  }, [id, token, user]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/projects/${id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data);
    } catch (err) {
      toast.error("Failed to fetch comments");
    }
  }, [id, token]);

  const handleDeleteComment = (commentId) => {
    const comment = comments.find(c => c._id === commentId);
    setCommentToDelete({ id: commentId, text: comment?.text || 'this comment' });
    setShowDeleteCommentModal(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      await axios.delete(`${API}/projects/${id}/comments/${commentToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Comment deleted successfully");
      fetchComments(); // Refresh comments
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
      await axios.post(`${API}/projects/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` },
      });

      toast.success("File uploaded successfully");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchProject();
      
      // Refresh notifications immediately
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    } catch (err) {
      toast.error(`Upload failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (attachmentId) => {
    try {
      const attachment = project.attachments.find(a => a._id === attachmentId);
      if (!attachment) {
        toast.error("Attachment not found");
        return;
      }

      const response = await axios.get(`${API}/projects/${id}/attachments/${attachmentId}/download`, {
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
        const response = await axios.get(`${API}/projects/${id}/attachments/${attachment._id}/download`, {
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
    const attachment = project.attachments.find(a => a._id === attachmentId);
    setAttachmentToDelete({ id: attachmentId, filename: attachment?.filename || 'this file' });
    setShowDeleteAttachmentModal(true);
  };

  const confirmDeleteAttachment = async () => {
    if (!attachmentToDelete) return;
    
    try {
      await axios.delete(`${API}/projects/${id}/attachments/${attachmentToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Attachment deleted successfully");
      fetchProject();
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

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="w-5 h-5 text-green-500" />;
      default:
        return <File className="w-5 h-5 text-blue-500" />;
    }
  };

  const isPreviewable = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt'].includes(ext);
  };

  const handleDeleteProject = () => {
    setShowDeleteProjectModal(true);
  };

  const confirmDeleteProject = async () => {
                try {
                  await axios.delete(`${API}/projects/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  toast.success("Project deleted successfully!");
                  navigate("/projects");
      setShowDeleteProjectModal(false);
                } catch (err) {
                  toast.error("Failed to delete project");
                }
  };

  const cancelDeleteProject = () => {
    setShowDeleteProjectModal(false);
  };

  const handleDeleteTask = (taskId, taskTitle) => {
    setTaskToDelete({ id: taskId, title: taskTitle });
    setShowDeleteTaskModal(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      await axios.delete(`${API}/tasks/${taskToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Task deleted successfully!");
      fetchTasks(); // Refresh tasks list
      setShowDeleteTaskModal(false);
      setTaskToDelete(null);
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const cancelDeleteTask = () => {
    setShowDeleteTaskModal(false);
    setTaskToDelete(null);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isCommentSubmitting) return;

    setIsCommentSubmitting(true);
    try {
      const res = await axios.post(
        `${API}/projects/${id}/comments`,
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProject(), fetchTasks(), fetchComments()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchProject, fetchTasks, fetchComments]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'on hold':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'To Do':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
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
              {/* Project Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Briefcase size={18} className="text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Loading Project Details</h3>
              <p className="text-gray-600">Fetching project information...</p>
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

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto px-4 py-4 w-full">
          <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6 text-center">
            <Briefcase size={48} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Not Found</h3>
            <p className="text-gray-600 mb-3">The project you're looking for doesn't exist or you don't have access to it.</p>
            <Link to="/projects" className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
              <ArrowRight size={16} />
              Back to Projects
            </Link>
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
                <Briefcase size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                Project Details
              </h1>
            </div>
            
            <div className="w-20"></div> {/* Spacer to center the title */}
          </div>
          
          {/* Mobile Layout - Centered Title */}
          <div className="md:hidden text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center">
                <Briefcase size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                Project Details
              </h1>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-3">
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            View and manage project information
          </p>
        </div>
        
        {/* Project Header Card */}
        <div className="mb-3">
          <div className="bg-gradient-to-r from-white to-green-50 rounded-xl shadow-lg border border-green-200 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                <Briefcase size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 break-words leading-tight mb-2">{project.name}</h2>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500 font-medium">Project Information</span>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)} shadow-sm`}>
                      {project.status}
                    </span>
                </div>
              </div>
                <p className="text-gray-700 text-base leading-relaxed">{project.description}</p>
            </div>
            </div>
          </div>
        </div>

                 {/* Top Section with Grid Layout */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
           {/* Main Content - Left Side */}
           <div className="lg:col-span-2 space-y-4">
            {/* Project Info Cards */}
             <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4">
               <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                 <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                   <CalendarDays className="text-white" size={12} />
                 </div>
                Project Information
              </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                   <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                     <CalendarDays className="text-green-600" size={16} />
                   </div>
                  <div>
                     <p className="text-sm text-gray-600 font-medium">Deadline</p>
                    <p className="font-semibold text-gray-800">
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
                 <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                   <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                     <Users className="text-purple-600" size={16} />
                   </div>
                  <div>
                     <p className="text-sm text-gray-600 font-medium">Team Size</p>
                    <p className="font-semibold text-gray-800">
                      {project.teamMembers?.length || 0} members
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks Section */}
                 <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4">
                   <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                     <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                       <ClipboardList className="text-white" size={12} />
                     </div>
                Project Tasks ({tasks.length})
              </h2>
              {tasks.length === 0 ? (
                     <div className="text-center py-6 min-h-[180px] flex flex-col justify-center items-center">
                       <ClipboardList size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No tasks for this project yet.</p>
                </div>
              ) : (
                                                                                                                                                                                                                                                                                                                                                               <div className="space-y-2 h-80 overflow-y-auto">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                       className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
                      onClick={() => navigate(`/tasks/${task._id}`)}
                    >
                       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                           <div className="flex items-start gap-2 mb-1">
                            <div className="flex-shrink-0 mt-0.5">
                              {getTaskStatusIcon(task.status)}
                            </div>
                            <h3 className="font-medium text-gray-800 group-hover:text-green-600 transition-colors break-words leading-tight">{task.title}</h3>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                            <span className="text-gray-600 flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                              Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <ArrowRight size={16} className="text-gray-400 group-hover:text-green-600 transition-colors" />
                                                       {user?.role === "Manager" && (
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <Link
                                to={`/tasks/${task._id}/edit`}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                              >
                                <Pencil size={16} />
                              </Link>
                              <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTask(task._id, task.title);
                                  }}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Delete Task"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
             </div>
            </div>

           {/* Sidebar - Right Side */}
           <div className="lg:col-span-1 space-y-4">
                           {/* Project Manager - Only show for non-managers */}
              {project.projectManager && user?.role !== "Manager" && (
                <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <UserCheck className="text-white" size={12} />
                    </div>
                    Project Manager
                  </h2>
                                     <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                     <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                       {project.projectManager.profileImage ? (
                         <img 
                           src={project.projectManager.profileImage} 
                           alt={project.projectManager.name}
                           className="w-full h-full object-cover"
                           onError={(e) => {
                             e.target.style.display = 'none';
                             e.target.nextSibling.style.display = 'flex';
                           }}
                         />
                       ) : null}
                       <div className={`w-full h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center ${project.projectManager.profileImage ? 'hidden' : 'flex'}`}>
                         <span className="text-white font-medium">
                           {project.projectManager.name?.charAt(0)?.toUpperCase() || 'P'}
                         </span>
                       </div>
                     </div>
                     <div>
                       <p className="font-medium text-gray-800">{project.projectManager.name}</p>
                       <p className="text-sm text-gray-500">{project.projectManager.email}</p>
                     </div>
                   </div>
                </div>
              )}

                                                       {/* Team Members */}
               <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4">
                 <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                   <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                     <Users className="text-white" size={12} />
                   </div>
                   Team Members
                 </h2>
                 {project.teamMembers?.length === 0 ? (
                   <p className="text-gray-500 text-center py-3">No team members assigned</p>
                 ) : (
                                                                               <div className="space-y-2 h-64 overflow-y-auto">
                                       {project.teamMembers?.map((member) => (
                      <div key={member._id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                          {member.profileImage ? (
                            <img 
                              src={member.profileImage} 
                              alt={member.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center ${member.profileImage ? 'hidden' : 'flex'}`}>
                            <span className="text-white font-medium">
                              {member.name?.charAt(0)?.toUpperCase() || 'M'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    ))}
                 </div>
               )}
             </div>

                                                                                                               {/* Project Actions - For Managers */}
                {user?.role === "Manager" && (
                 <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4">
                   <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                     <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                       <Edit3 className="text-white" size={12} />
                     </div>
                     Project Actions
                   </h2>
                   <div className="space-y-3 min-h-[120px] flex flex-col justify-center">
                     <Link
                       to={`/projects/edit/${project._id}`}
                       className="flex items-center gap-3 w-full p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 rounded-lg hover:from-yellow-100 hover:to-yellow-200 transition-all duration-200 border border-yellow-200 hover:shadow-md"
                     >
                       <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                         <Edit3 className="text-white" size={16} />
                       </div>
                       <span className="font-semibold text-sm">Edit Project</span>
                     </Link>
                     <button
                       onClick={handleDeleteProject}
                       className="flex items-center gap-3 w-full p-3 bg-gradient-to-r from-red-50 to-red-100 text-red-800 rounded-lg hover:from-red-100 hover:to-red-200 transition-all duration-200 border border-red-200 hover:shadow-md"
                     >
                       <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                         <Trash2 className="text-white" size={16} />
                       </div>
                       <span className="font-semibold text-sm">Delete Project</span>
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
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={12} />
                </div>
                Project Attachments ({project.attachments?.length || 0})
              </h2>
              
              {/* File Upload - Hidden for Admin */}
              {user?.role !== 'Admin' && (
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
              )}

              {/* Attachments List */}
              {!project.attachments || project.attachments.length === 0 ? (
               <div className="text-center py-6 min-h-[180px] flex flex-col justify-center items-center">
                 <FileText size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No attachments uploaded yet.</p>
                </div>
              ) : (
               <div className="space-y-2">
                  {project.attachments.map((attachment) => (
                   <div key={attachment._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(attachment.filename)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{attachment.filename}</p>
                          <p className="text-sm text-gray-500">
                            {attachment.uploadedAt ? new Date(attachment.uploadedAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isPreviewable(attachment.filename) && (
                          <button
                            onClick={() => handlePreview(attachment)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Preview"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(attachment._id)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                                                 {user?.role === 'Manager' && (
                           <button
                             onClick={() => handleDeleteAttachment(attachment._id)}
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
                  {comments.map((comment) => (
                    <div key={comment._id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 relative group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {comment.author?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{comment.author?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                                                 {user?.role === 'Manager' && (
                           <button
                             onClick={() => handleDeleteComment(comment._id)}
                             className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all duration-200"
                             title="Delete comment"
                           >
                             <Trash2 size={14} />
                           </button>
                         )}

                      </div>
                      <p className="text-gray-700 ml-10">{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Form - Hidden for Admin */}
              {user?.role !== 'Admin' && (
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
              )}
            </div>
          </div>
      </main>
      <Footer />

             {/* Delete Task Modal */}
       {showDeleteTaskModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
             {/* Modal Header */}
             <div className="flex items-center justify-between p-6 border-b border-gray-200">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                   <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                   <h3 className="text-lg font-semibold text-gray-800">Delete Task</h3>
                   <p className="text-sm text-gray-600">Confirm task deletion</p>
                 </div>
               </div>
               <button
                 onClick={cancelDeleteTask}
                 className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>

             {/* Modal Body */}
             <div className="p-6">
               <div className="mb-4">
                 <p className="text-gray-700 mb-3">
                   Are you sure you want to delete the task{" "}
                   <span className="font-semibold text-gray-800">"{taskToDelete?.title}"</span>?
                 </p>
                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                   <div className="flex items-start gap-3">
                     <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                     <div>
                       <p className="text-sm font-medium text-red-800 mb-1">Warning</p>
                       <p className="text-sm text-red-700">
                         This action cannot be undone. All task data, comments, and attachments will be permanently deleted.
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             {/* Modal Footer */}
             <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
               <button
                 onClick={cancelDeleteTask}
                 className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
               >
                 Cancel
               </button>
               <button
                 onClick={confirmDeleteTask}
                 className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
               >
                 <Trash2 className="w-4 h-4" />
                 Delete Task
               </button>
                  </div>
                </div>
              </div>
            )}

       {/* Delete Project Modal */}
       {showDeleteProjectModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
             {/* Modal Header */}
             <div className="flex items-center justify-between p-6 border-b border-gray-200">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                   <Trash2 className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                   <h3 className="text-lg font-semibold text-gray-800">Delete Project</h3>
                   <p className="text-sm text-gray-600">Confirm project deletion</p>
                      </div>
                    </div>
               <button
                 onClick={cancelDeleteProject}
                 className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>

             {/* Modal Body */}
             <div className="p-6">
               <div className="mb-4">
                 <p className="text-gray-700 mb-3">
                   Are you sure you want to delete the project{" "}
                   <span className="font-semibold text-gray-800">"{project?.name}"</span>?
                 </p>
                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                   <div className="flex items-start gap-3">
                     <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                     <div>
                       <p className="text-sm font-medium text-red-800 mb-1">Warning</p>
                       <p className="text-sm text-red-700">
                         This action cannot be undone. All project data, tasks, comments, and attachments will be permanently deleted.
                       </p>
                     </div>
                      </div>
                    </div>
                </div>
            </div>

             {/* Modal Footer */}
             <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
               <button
                 onClick={cancelDeleteProject}
                 className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
               >
                 Cancel
               </button>
                  <button
                 onClick={confirmDeleteProject}
                 className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                 <Trash2 className="w-4 h-4" />
                 Delete Project
                  </button>
             </div>
                </div>
                </div>
              )}

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
    </div>
  );
}

export default ProjectDetailPage;