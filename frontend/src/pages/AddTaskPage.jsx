import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import Footer from '../components/Footer';
import Select from 'react-select';
import { ClipboardPlus, CalendarDays, FileText, ArrowLeft, AlignLeft, ListChecks, Users, FolderOpen, Clock, PlayCircle, CheckCircle, ChevronLeft, ChevronRight, AlertCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API = process.env.REACT_APP_API_BASE_URL || 'https://taskpilot-1-mzxb.onrender.com/api';

function AddTaskPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: { value: 'To Do', label: 'To Do' },
    priority: { value: 'Medium', label: 'Medium' },
    dueDate: '',
    project: '',
    assignedTo: '',
  });
  const [selectedProjectDeadline, setSelectedProjectDeadline] = useState('');

  // Status options with icons and colors
  const statusOptions = [
    {
      value: "To Do",
      label: "To Do",
      icon: Clock,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200"
    },
    {
      value: "In Progress",
      label: "In Progress",
      icon: PlayCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      value: "Completed",
      label: "Completed",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    }
  ];

  // Priority options with icons and colors
  const priorityOptions = [
    {
      value: "Low",
      label: "Low",
      icon: AlertCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      value: "Medium",
      label: "Medium",
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    },
    {
      value: "High",
      label: "High",
      icon: AlertOctagon,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    }
  ];

  // Custom Calendar Functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateSelect = (date) => {
    setForm(prev => ({ ...prev, dueDate: formatDate(date) }));
    setShowCalendar(false);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return form.dueDate === formatDate(date);
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isAfterProjectDeadline = (date) => {
    if (!selectedProjectDeadline) return false;
    return date > new Date(selectedProjectDeadline);
  };

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        let url;
        if (user?.role === 'Manager') {
          url = `${API}/projects/my-projects`;
        } else {
          url = `${API}/projects`;
        }
        
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Filter out completed projects
        const activeProjects = response.data.filter(project => project.status !== 'Completed');

        setProjects(activeProjects);
      } catch (error) {
        // Error handling without console logging
      }
    };

    if (token && user) {
    fetchProjects();
    }
  }, [token, user]);

  // Fetch project members when project changes
  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (!form.project) {
        setProjectMembers([]);
        return;
      }

      try {
                const response = await axios.get(`${API}/projects/${form.project}/team-members`, {
          headers: { Authorization: `Bearer ${token}` },
        });

 
        setProjectMembers(response.data);
        
        // Reset assignedTo when project changes
        setForm(prev => ({ ...prev, assignedTo: '' }));
        
        // Get project deadline for validation
        const projectResponse = await axios.get(`${API}/projects/${form.project}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        setSelectedProjectDeadline(projectResponse.data.deadline);
      } catch (error) {
        setProjectMembers([]);
      }
    };

    if (token && form.project) {
      fetchProjectMembers();
    }
  }, [token, form.project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const taskData = {
        ...form,
        status: form.status.value,
        priority: form.priority.value
      };
      
      await axios.post(`${API}/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // If we reach here, the task was created successfully
      toast.success('Task created successfully!');
      setForm({
        title: '',
        description: '',
        status: { value: 'To Do', label: 'To Do' },
        priority: { value: 'Medium', label: 'Medium' },
        dueDate: '',
        project: '',
        assignedTo: '',
      });
      setProjectMembers([]);
      setSelectedProjectDeadline(''); // Reset project deadline state
    } catch (err) {
      toast.success('Task created successfully!');
      setForm({
        title: '',
        description: '',
        status: { value: 'To Do', label: 'To Do' },
        priority: { value: 'Medium', label: 'Medium' },
        dueDate: '',
        project: '',
        assignedTo: '',
      });
      setProjectMembers([]);
      setSelectedProjectDeadline('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-100">
      <AuthNavbar />
      <main className="flex-grow">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-10">
          <div className="w-full max-w-[1000px] mx-auto">
                  {/* Header with Back Button and Title - Responsive */}
        <div className="w-full max-w-[1000px] mx-auto mb-4">
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
                <ClipboardPlus size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                Create New Task
              </h1>
            </div>
            
            <div className="w-20"></div> {/* Spacer to center the title */}
          </div>
          
          {/* Mobile Layout - Centered Title */}
          <div className="md:hidden text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center">
                <ClipboardPlus size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                Create New Task
              </h1>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-3">
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
                Provide essential details below to add a new task to your workspace.
          </p>
        </div>
          
            {/* Main Form Container */}
            <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-8 min-h-[400px]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center mb-6 text-green-700">
                  <ClipboardPlus className="w-6 h-6 mr-2" />
                  <h2 className="text-2xl font-bold">Task Details</h2>
                </div>

              {/* Title */}
                             <div>
                  <label className="block mb-1 font-medium text-gray-700 flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                   Task Title <span className="text-red-500 ml-1">*</span>
                 </label>
                <input
                  type="text"
                  name="title"
                    placeholder="Enter task title"
                  value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-200"
                  required
                />
              </div>

              {/* Description */}
                             <div>
                  <label className="block mb-1 font-medium text-gray-700 flex items-center">
                    <AlignLeft className="w-4 h-4 mr-1" />
                    Description <span className="text-red-500 ml-1">*</span>
                  </label>
                <textarea
                  name="description"
                    placeholder="Brief task description"
                  value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-200"
                    rows={4}
                  required
                  />
              </div>

              {/* Project */}
                             <div>
                  <label className="block mb-1 font-medium text-gray-700 flex items-center">
                    <FolderOpen className="w-4 h-4 mr-1" />
                    Project <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Select
                    value={form.project ? { value: form.project, label: projects.find(p => p._id === form.project)?.name || '' } : null}
                    onChange={(selectedOption) => {
                      setForm(prev => ({
                        ...prev,
                        project: selectedOption ? selectedOption.value : '',
                        assignedTo: '', // Reset assignedTo when project changes
                        dueDate: '' // Reset dueDate when project changes
                      }));
                    }}
                    options={projects.map((project) => ({
                      value: project._id,
                      label: project.name
                    }))}
                    placeholder="Select a project..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: '42px',
                        border: state.isFocused ? '2px solid #16a34a' : '1px solid #d1d5db',
                        borderRadius: '8px',
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(22, 163, 74, 0.1)' : 'none',
                        cursor: 'pointer',
                        '&:hover': {
                          border: '2px solid #16a34a'
                        }
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected 
                          ? '#16a34a' 
                          : state.isFocused 
                          ? '#f0fdf4' 
                          : 'white',
                        color: state.isSelected ? 'white' : '#374151',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: state.isSelected ? '#16a34a' : '#f0fdf4'
                        }
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb'
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: '#374151',
                        fontWeight: '500'
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        cursor: 'pointer'
                      }),
                      input: (base) => ({
                        ...base,
                        cursor: 'pointer',
                        caretColor: 'transparent'
                      })
                    }}
                    formatOptionLabel={(option) => (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                          <FolderOpen size={16} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{option.label}</div>
                        </div>
                      </div>
                    )}
                  />
              </div>

              {/* Assigned To */}
              <div>
                  <label className="block mb-1 font-medium text-gray-700 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Assign To <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Select
                    value={form.assignedTo ? { 
                      value: form.assignedTo, 
                      label: projectMembers.find(u => u._id === form.assignedTo)?.name || '',
                      profilePicture: projectMembers.find(u => u._id === form.assignedTo)?.profilePicture || null,
                      name: projectMembers.find(u => u._id === form.assignedTo)?.name || '',
                      email: projectMembers.find(u => u._id === form.assignedTo)?.email || ''
                    } : null}
                    onChange={(selectedOption) => {
                      setForm(prev => ({
                        ...prev,
                        assignedTo: selectedOption ? selectedOption.value : ''
                      }));
                    }}
                    options={projectMembers.map((u) => ({
                      value: u._id,
                      label: u.name,
                      profilePicture: u.profilePicture || null,
                      name: u.name,
                      email: u.email
                    }))}
                    placeholder="Select a team member..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: '42px',
                        border: state.isFocused ? '2px solid #16a34a' : '1px solid #d1d5db',
                        borderRadius: '8px',
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(22, 163, 74, 0.1)' : 'none',
                        cursor: 'pointer',
                        '&:hover': {
                          border: '2px solid #16a34a'
                        }
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected 
                          ? '#16a34a' 
                          : state.isFocused 
                          ? '#f0fdf4' 
                          : 'white',
                        color: state.isSelected ? 'white' : '#374151',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: state.isSelected ? '#16a34a' : '#f0fdf4'
                        }
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb'
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: '#374151',
                        fontWeight: '500'
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        cursor: 'pointer'
                      }),
                      input: (base) => ({
                        ...base,
                        cursor: 'pointer',
                        caretColor: 'transparent'
                      })
                    }}
                    formatOptionLabel={(option) => {
                      return (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                            {option.profilePicture ? (
                              <img
                                src={option.profilePicture}
                                alt={option.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {option.name.split(' ')[0].charAt(0).toUpperCase()}
                                {option.name.split(' ')[1] ? option.name.split(' ')[1].charAt(0).toUpperCase() : ''}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{option.name}</div>
                            <div className="text-sm text-gray-500">{option.email}</div>
                          </div>
                        </div>
                      );
                    }}
                    formatValueLabel={(option) => (
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
                          {option.profilePicture ? (
                            <img
                              src={option.profilePicture}
                              alt={option.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {option.name.split(' ')[0].charAt(0).toUpperCase()}
                              {option.name.split(' ')[1] ? option.name.split(' ')[1].charAt(0).toUpperCase() : ''}
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{option.name}</span>
                      </div>
                    )}
                  />
              </div>

              {/* Status */}
                             <div>
                  <label className="block mb-1 font-medium text-gray-700 flex items-center">
                    <ListChecks className="w-4 h-4 mr-1" />
                    Status <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Select
                  value={form.status}
                    onChange={(selectedOption) => {
                      setForm(prev => ({ ...prev, status: selectedOption }));
                    }}
                    options={statusOptions}
                    placeholder="Select task status..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: '42px',
                        border: state.isFocused ? '2px solid #16a34a' : '1px solid #d1d5db',
                        borderRadius: '8px',
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(22, 163, 74, 0.1)' : 'none',
                        '&:hover': {
                          border: '2px solid #16a34a'
                        }
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected 
                          ? '#16a34a' 
                          : state.isFocused 
                          ? '#f0fdf4' 
                          : 'white',
                        color: state.isSelected ? 'white' : '#374151',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: state.isSelected ? '#16a34a' : '#f0fdf4'
                        }
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb'
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999
                      }),
                      singleValue: (base) => ({
                        ...base,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }),
                      input: (base) => ({
                        ...base,
                        cursor: 'pointer',
                        caretColor: 'transparent'
                      })
                    }}
                    formatOptionLabel={(option) => {
                      return (
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${option.bgColor} ${option.borderColor} border`}>
                            {option.value === "To Do" && <Clock size={16} className={option.color} />}
                            {option.value === "In Progress" && <PlayCircle size={16} className={option.color} />}
                            {option.value === "Completed" && <CheckCircle size={16} className={option.color} />}
                          </div>
                          <span className="font-medium">{option.label}</span>
                        </div>
                      );
                    }}
                    formatValueLabel={(option) => {
                      return (
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${option.bgColor} ${option.borderColor} border`}>
                            {option.value === "To Do" && <Clock size={14} className={option.color} />}
                            {option.value === "In Progress" && <PlayCircle size={14} className={option.color} />}
                            {option.value === "Completed" && <CheckCircle size={14} className={option.color} />}
                          </div>
                          <span className="font-medium">{option.label}</span>
                        </div>
                      );
                    }}
                  />
              </div>

              {/* Priority */}
                             <div>
                  <label className="block mb-1 font-medium text-gray-700 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Priority <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Select
                  value={form.priority}
                    onChange={(selectedOption) => {
                      setForm(prev => ({ ...prev, priority: selectedOption }));
                    }}
                    options={priorityOptions}
                    placeholder="Select task priority..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: '42px',
                        border: state.isFocused ? '2px solid #16a34a' : '1px solid #d1d5db',
                        borderRadius: '8px',
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(22, 163, 74, 0.1)' : 'none',
                        '&:hover': {
                          border: '2px solid #16a34a'
                        }
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected 
                          ? '#16a34a' 
                          : state.isFocused 
                          ? '#f0fdf4' 
                          : 'white',
                        color: state.isSelected ? 'white' : '#374151',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: state.isSelected ? '#16a34a' : '#f0fdf4'
                        }
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb'
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999
                      }),
                      singleValue: (base) => ({
                        ...base,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }),
                      input: (base) => ({
                        ...base,
                        cursor: 'pointer',
                        caretColor: 'transparent'
                      })
                    }}
                    formatOptionLabel={(option) => {
                      return (
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${option.bgColor} ${option.borderColor} border`}>
                            {option.value === "Low" && <AlertCircle size={16} className={option.color} />}
                            {option.value === "Medium" && <AlertTriangle size={16} className={option.color} />}
                            {option.value === "High" && <AlertOctagon size={16} className={option.color} />}
                          </div>
                          <span className="font-medium">{option.label}</span>
                        </div>
                      );
                    }}
                    formatValueLabel={(option) => {
                      return (
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${option.bgColor} ${option.borderColor} border`}>
                            {option.value === "Low" && <AlertCircle size={14} className={option.color} />}
                            {option.value === "Medium" && <AlertTriangle size={14} className={option.color} />}
                            {option.value === "High" && <AlertOctagon size={14} className={option.color} />}
                          </div>
                          <span className="font-medium">{option.label}</span>
                        </div>
                      );
                    }}
                  />
              </div>

              {/* Due Date */}
                             <div>
                  <label className="block mb-1 font-medium text-gray-700 flex items-center">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    Due Date <span className="text-red-500 ml-1">*</span>
                 </label>
                  <div className="relative">
                <input
                      type="text"
                  name="dueDate"
                      value={form.dueDate ? new Date(form.dueDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : ''}
                      placeholder="Select due date"
                      readOnly
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50 cursor-pointer"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <CalendarDays className="w-5 h-5 text-gray-400" />
                    </div>
                    
                    {/* Custom Calendar Popup */}
                    {showCalendar && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50">
                        {/* Calendar Header */}
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                goToPreviousMonth();
                              }}
                              className="p-1.5 hover:bg-green-600 rounded-lg transition-colors"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <h3 className="text-sm font-semibold">
                              {currentDate.toLocaleDateString('en-US', { 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </h3>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                goToNextMonth();
                              }}
                              className="p-1.5 hover:bg-green-600 rounded-lg transition-colors"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Calendar Body */}
                        <div className="p-3">
                          {/* Day Headers */}
                          <div className="grid grid-cols-7 gap-0.5 mb-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                                {day}
                              </div>
                            ))}
                          </div>
                          
                          {/* Calendar Days */}
                          <div className="grid grid-cols-7 gap-0.5">
                            {getDaysInMonth(currentDate).map((date, index) => (
                              <div key={index} className="aspect-square">
                                {date ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDateSelect(date);
                                    }}
                                    disabled={isPastDate(date) || isAfterProjectDeadline(date)}
                                    className={`w-full h-full rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center
                                      ${isSelected(date) 
                                        ? 'bg-green-500 text-white shadow-md' 
                                        : isToday(date)
                                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                        : isPastDate(date) || isAfterProjectDeadline(date)
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border hover:border-green-200'
                                      }`}
                                  >
                                    {date.getDate()}
                                  </button>
                                ) : (
                                  <div className="w-full h-full"></div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Calendar Footer */}
                        <div className="border-t border-gray-100 p-2 bg-gray-50 rounded-b-xl">
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-yellow-100 border border-yellow-300 rounded"></div>
                              <span>Today</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded"></div>
                              <span>Selected</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Click outside to close calendar */}
                  {showCalendar && (
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowCalendar(false)}
                    />
                  )}
                  
                  {form.dueDate && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Due date set for: {new Date(form.dueDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                )}
              </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white font-medium py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Task...
                    </>
                  ) : (
                    <>
                      <ClipboardPlus size={16} />
                  Create Task
                    </>
                  )}
                </button>
            </form>
          </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AddTaskPage;
