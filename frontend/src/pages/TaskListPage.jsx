import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import DashboardNavbar from '../components/AuthNavbar';
import { Trash2, PencilLine, CheckSquare, Clock, AlertCircle, Filter, X, ChevronDown, ArrowLeft, ArrowRight, Users, Briefcase, Plus } from 'lucide-react';
import Select from 'react-select';

import { toast } from 'react-hot-toast';


const API = process.env.REACT_APP_API_BASE_URL || 'https://taskpilot-1-mzxb.onrender.com/api';

function TaskListPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTeam, setFilterTeam] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [teamOptions, setTeamOptions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [teamPages, setTeamPages] = useState({});
  const [projectPages, setProjectPages] = useState({});
  const [tasksPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTask, setDeleteTask] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialUserId = queryParams.get('assignedTo') || '';

  const [filterUser, setFilterUser] = useState(initialUserId);

  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        let url;
        if (user?.role === 'Team Member') {
          url = `${API}/tasks/my-tasks`;
        } else if (user?.role === 'Manager') {
          url = `${API}/tasks/manager-tasks`;
        } else {
          url = `${API}/tasks`;
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    if (token && user) fetchTasks();
  }, [token, user]);



  useEffect(() => {
    const fetchTeam = async () => {
      try {
        let url;
        if (user?.role === 'Manager') {
          url = `${API}/users/my-team-members`;
        } else {
          url = `${API}/users/team-members`;
        }
        
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(res.data)) {
          setTeamOptions(res.data);
        } else {
          setTeamOptions([]); 
        }
      } catch (err) {
        setTeamOptions([]); 
      }
    };
    fetchTeam();
  }, [token, user?.role]);

  // Fetch teams and projects for Admin and Manager view
  useEffect(() => {
    const fetchTeamsAndProjects = async () => {
      if (user?.role === 'Admin' || user?.role === 'Manager') {
        try {
          // Use my-projects endpoint for managers to get their projects
          let projectsUrl;
          if (user?.role === 'Manager') {
            projectsUrl = `${API}/projects/my-projects`;
          } else {
            projectsUrl = `${API}/projects`;
          }

          if (user?.role === 'Admin') {
            // Admin needs both teams and projects
            const [teamsRes, projectsRes] = await Promise.all([
              axios.get(`${API}/teams`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              axios.get(projectsUrl, {
                headers: { Authorization: `Bearer ${token}` },
              })
            ]);
            
            // Sort teams and projects by creation date (newest first)
            const sortedTeams = teamsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const sortedProjects = projectsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            setTeams(sortedTeams);
            setProjects(sortedProjects);
          } else {
            // Manager only needs projects (no team filter)
            const projectsRes = await axios.get(projectsUrl, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            const sortedProjects = projectsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setProjects(sortedProjects);
          }
        } catch (error) {
        }
      }
    };
    
    fetchTeamsAndProjects();
  }, [token, user?.role]);

  // Fetch projects for Team Member
  useEffect(() => {
    const fetchMyProjects = async () => {
      if (user?.role === 'Team Member') {
        try {
          const res = await axios.get(`${API}/projects/my-projects`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const sortedProjects = Array.isArray(res.data) ? res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
          setProjects(sortedProjects);
        } catch (error) {
          setProjects([]);
        }
      }
    };
    fetchMyProjects();
  }, [token, user?.role]);


  const handleDelete = (task) => {
    setDeleteTask(task);
    setShowDeleteDialog(true);
  };

  const confirmDeleteTask = async () => {
    if (!deleteTask) return;
    
    try {
      await axios.delete(`${API}/tasks/${deleteTask._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Task deleted successfully');
      // Refresh the tasks list
      const fetchTasks = async () => {
        try {
          let url;
          if (user?.role === 'Team Member') {
            url = `${API}/tasks/my-tasks`;
          } else if (user?.role === 'Manager') {
            url = `${API}/tasks/manager-tasks`;
          } else {
            url = `${API}/tasks`;
          }

          const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setTasks(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          toast.error("Failed to refresh tasks");
        }
      };
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setShowDeleteDialog(false);
      setDeleteTask(null);
    }
  };

  const cancelDeleteTask = () => {
    setShowDeleteDialog(false);
    setDeleteTask(null);
  };

  const filteredTasks = Array.isArray(tasks)
    ? tasks
        .filter((task) => {
        const matchesUser =
          filterUser && Array.isArray(task.assignedTo)
            ? task.assignedTo.some((u) => u?._id === filterUser)
            : true;
        const matchesTeam = filterTeam ? 
          (task.assignedTo && Array.isArray(task.assignedTo) && 
           task.assignedTo.some(user => {
             const userId = typeof user === 'string' ? user : user._id;
             const team = teams.find(t => t._id === filterTeam);
             return team?.members?.some(member => 
               (typeof member === 'string' ? member : member._id) === userId
             );
           })) : true;
        const matchesProject = filterProject ? 
          (task.project && 
           (typeof task.project === 'string' ? task.project === filterProject : task.project._id === filterProject)) : true;
        const matchesSearch =
          task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesUser && matchesTeam && matchesProject && matchesSearch;
      })
        .sort((a, b) => {
          // Sort by creation date (newest first) - assuming tasks have createdAt field
          // If createdAt doesn't exist, fall back to _id (which often contains timestamp)
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a._id);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b._id);
          return dateB - dateA;
        })
    : [];

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'Medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Low':
        return <CheckSquare className="w-4 h-4 text-green-500" />;
      default:
        return <CheckSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'To Do':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckSquare size={12} className="text-green-600" />;
      case 'In Progress':
        return <Clock size={12} className="text-blue-600" />;
      case 'To Do':
        return <AlertCircle size={12} className="text-yellow-600" />;
      default:
        return <AlertCircle size={12} className="text-gray-600" />;
    }
  };

  // Pagination logic for non-Admin view
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterUser, filterTeam, filterProject, searchTerm]);

  const handleResetFilters = () => {
    setFilterUser('');
    setFilterTeam('');
    setFilterProject('');
    setSearchTerm('');
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Hierarchical grouping function for Admin view
  const groupTasksByTeamAndProject = () => {
    if (user?.role !== 'Admin') {
      return null;
    }

    const groupedTasks = {};
    
    teams.forEach(team => {
      groupedTasks[team._id] = {
        team: team,
        projects: {}
      };
    });

    // Add unassigned team
    groupedTasks['unassigned'] = {
      team: { name: 'Unassigned Team', _id: 'unassigned' },
      projects: {}
    };

    filteredTasks.forEach(task => {
      let assignedToTeam = false;
      
      // Find which team this task belongs to based on assigned user
      teams.forEach(team => {
        if (task.assignedTo && Array.isArray(task.assignedTo)) {
          const assignedUserIds = task.assignedTo.map(user => 
            typeof user === 'string' ? user : user._id
          );
          
          // Check if any assigned user belongs to this team
          const teamMemberIds = team.members?.map(member => 
            typeof member === 'string' ? member : member._id
          ) || [];
          
          if (assignedUserIds.some(userId => teamMemberIds.includes(userId))) {
            if (!groupedTasks[team._id]) {
              groupedTasks[team._id] = { team: team, projects: {} };
            }
            
            const projectId = task.project?._id || task.project || 'unassigned';
            const projectName = task.project?.name || 'Unassigned Project';
            
            if (!groupedTasks[team._id].projects[projectId]) {
              groupedTasks[team._id].projects[projectId] = {
                project: { _id: projectId, name: projectName },
                tasks: []
              };
            }
            
            groupedTasks[team._id].projects[projectId].tasks.push(task);
            // Sort tasks by creation date (newest first)
            groupedTasks[team._id].projects[projectId].tasks.sort((a, b) => 
              new Date(b.createdAt) - new Date(a.createdAt)
            );
            assignedToTeam = true;
          }
        }
      });

      if (!assignedToTeam) {
        const projectId = task.project?._id || task.project || 'unassigned';
        const projectName = task.project?.name || 'Unassigned Project';
        
        if (!groupedTasks['unassigned'].projects[projectId]) {
          groupedTasks['unassigned'].projects[projectId] = {
            project: { _id: projectId, name: projectName },
            tasks: []
          };
        }
        
        groupedTasks['unassigned'].projects[projectId].tasks.push(task);
        // Sort tasks by creation date (newest first)
        groupedTasks['unassigned'].projects[projectId].tasks.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
      }
    });

    return groupedTasks;
  };

  // Pagination handlers for hierarchical view
  const handleTeamPageChange = (teamId, pageNumber) => {
    setTeamPages(prev => ({
      ...prev,
      [teamId]: pageNumber
    }));
  };

  const handleProjectPageChange = (projectId, pageNumber) => {
    setProjectPages(prev => ({
      ...prev,
      [projectId]: pageNumber
    }));
  };

  const handleNextPage = (teamId, projectId, totalPages) => {
    if (projectId) {
      setProjectPages(prev => ({
        ...prev,
        [projectId]: Math.min((prev[projectId] || 1) + 1, totalPages)
      }));
    } else {
      setTeamPages(prev => ({
        ...prev,
        [teamId]: Math.min((prev[teamId] || 1) + 1, totalPages)
      }));
    }
  };

  const handlePrevPage = (teamId, projectId) => {
    if (projectId) {
      setProjectPages(prev => ({
        ...prev,
        [projectId]: Math.max((prev[projectId] || 1) - 1, 1)
      }));
    } else {
      setTeamPages(prev => ({
        ...prev,
        [teamId]: Math.max((prev[teamId] || 1) - 1, 1)
      }));
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
      <style>
        {`
          select option {
            padding: 8px 12px;
            background-color: white;
            color: #374151;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          select option:hover {
            background-color: #f0fdf4;
          }
          
          select option:checked {
            background-color: #dcfce7;
            color: #166534;
            font-weight: 500;
          }
          
          select:focus option:checked {
            background-color: #bbf7d0;
          }
        `}
      </style>
      <DashboardNavbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6">
                 {loading ? (
           /* Loading State */
          <div className="flex flex-col items-center justify-center py-16">
             <div className="relative">
               {/* Spinning Circle */}
              <div className="w-14 h-14 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
               {/* Task Icon Overlay */}
               <div className="absolute inset-0 flex items-center justify-center">
                <CheckSquare size={20} className="text-green-600" />
               </div>
             </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Tasks</h3>
              <p className="text-gray-600 text-sm">Fetching your task list...</p>
             </div>
             {/* Loading Dots */}
            <div className="flex space-x-2 mt-3">
               <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
               <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
             </div>
           </div>
         ) : (
           <>
            {/* Header with Back Button and Title - Responsive */}
            <div className="mb-4">
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
                    {user?.role === 'Team Member' ? 'My Tasks' : 
                     user?.role === 'Manager' ? 'Assigned Project Tasks' : 
                     'All Tasks'}
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
                   {user?.role === 'Team Member' ? 'My Tasks' : 
                    user?.role === 'Manager' ? 'Assigned Project Tasks' : 
                    'All Tasks'}
                 </h1>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-3">
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                Manage and track your project tasks
              </p>
            </div>

            {/* Add Task Button and Filters Toggle Button on same line */}
            <div className="flex justify-between items-center mb-4">
             {user?.role === "Manager" && (
                 <Link
                   to="/add-task"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-sm"
                 >
                  <CheckSquare size={18} />
                   Add New Task
                 </Link>
              )}
              <div className="flex-1"></div> {/* Spacer to push button to right */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 font-medium text-sm"
              >
                <Filter size={18} />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
               </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold text-gray-800">Filter Tasks</h3>
                 <button
                   onClick={handleResetFilters}
                    className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors font-medium"
                 >
                   Reset Filters
                 </button>
               </div>
                <div className={`grid gap-3 ${user?.role === 'Admin' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : user?.role === 'Team Member' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                 <input
                   type="text"
                    placeholder="Search Task"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                 />

                 

                  {/* Filter by User - For Manager/Admin */}
                  {user?.role !== 'Team Member' && (
                    <Select
                      value={filterUser ? {
                        value: filterUser,
                        label: teamOptions.find(u => u._id === filterUser)?.name || 'Unknown',
                        avatar: teamOptions.find(u => u._id === filterUser)?.profilePicture || '',
                        email: teamOptions.find(u => u._id === filterUser)?.email || '',
                      } : null}
                      onChange={option => setFilterUser(option ? option.value : '')}
                      options={[
                        { value: '', label: 'Filter by User', isDisabled: true },
                        ...teamOptions.map(u => ({
                          value: u._id,
                          label: u.name,
                          avatar: u.profilePicture || '',
                          email: u.email || '',
                        }))
                      ]}
                      isSearchable={true}
                      placeholder="Filter by User"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          minHeight: '42px',
                          borderRadius: '8px',
                          borderColor: state.isFocused ? '#16a34a' : '#d1d5db',
                          boxShadow: state.isFocused ? '0 0 0 3px rgba(22, 163, 74, 0.1)' : 'none',
                          '&:hover': { borderColor: '#16a34a' },
                          cursor: 'pointer',
                        }),
                        option: (base, state) => ({
                          ...base,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          backgroundColor: state.isSelected
                            ? '#16a34a'
                            : state.isFocused
                            ? '#f0fdf4'
                            : 'white',
                          color: state.isSelected ? 'white' : '#374151',
                          fontWeight: state.isSelected ? 600 : 500,
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                        }),
                        singleValue: (base) => ({
                          ...base,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }),
                        menu: (base) => ({
                          ...base,
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          border: '1px solid #e5e7eb',
                        }),
                      }}
                      formatOptionLabel={option =>
                        option.value === '' ? (
                          <span className="text-gray-400">{option.label}</span>
                        ) : (
                          <span className="flex items-center gap-2 px-2 py-1 rounded">
                            {option.avatar ? (
                              <img src={option.avatar} alt={option.label} className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <span className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-xs">
                                {option.label?.charAt(0).toUpperCase()}
                              </span>
                            )}
                            <span>{option.label}</span>
                            {option.email && <span className="text-xs text-gray-400 ml-2">{option.email}</span>}
                          </span>
                        )
                      }
                    />
                  )}

                  {/* Filter by Project */}
                  <Select
                    value={filterProject ? {
                      value: filterProject,
                      label: projects.find(p => p._id === filterProject)?.name || 'Unknown',
                    } : null}
                    onChange={option => setFilterProject(option ? option.value : '')}
                    options={[
                      { value: '', label: 'Filter by Project', isDisabled: true },
                      ...projects.map(p => ({
                        value: p._id,
                        label: p.name,
                      }))
                    ]}
                    isSearchable={true}
                    placeholder="Filter by Project"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: '42px',
                        borderRadius: '8px',
                        borderColor: state.isFocused ? '#16a34a' : '#d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(22, 163, 74, 0.1)' : 'none',
                        '&:hover': { borderColor: '#16a34a' },
                        cursor: 'pointer',
                      }),
                      option: (base, state) => ({
                        ...base,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: state.isSelected
                          ? '#16a34a'
                          : state.isFocused
                          ? '#f0fdf4'
                          : 'white',
                        color: state.isSelected ? 'white' : '#374151',
                        fontWeight: state.isSelected ? 600 : 500,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb',
                      }),
                    }}
                    formatOptionLabel={option =>
                      option.value === '' ? (
                        <span className="text-gray-400">{option.label}</span>
                      ) : (
                        <span className="flex items-center gap-2 px-2 py-1 rounded">
                          <span>{option.label}</span>
                        </span>
                      )
                    }
                  />


             </div>

                {/* Active Filters Display */}
                {(filterUser || filterTeam || filterProject || searchTerm) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">

                      {filterUser && (
                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          User: {teamOptions.find(u => u._id === filterUser)?.name || 'Unknown'}
                         <button
                            onClick={() => setFilterUser('')}
                            className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                          >
                            <X size={12} />
                         </button>
                        </span>
                  )}
                                             {filterTeam && (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          Team: {teams.find(t => t._id === filterTeam)?.name || 'Unknown'}
                          <button
                            onClick={() => setFilterTeam('')}
                            className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      )}
                      {filterProject && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          Project: {projects.find(p => p._id === filterProject)?.name || 'Unknown'}
                          <button
                            onClick={() => setFilterProject('')}
                            className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      )}

                      {searchTerm && (
                         <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                           Search: "{searchTerm}"
                     <button
                             onClick={() => setSearchTerm('')}
                             className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                           >
                             <X size={12} />
                     </button>
                         </span>
                       )}
                 </div>
                  </div>
                )}
               </div>
             )}

            {/* No records found message if no tasks after filtering/searching */}
            {filteredTasks.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-green-100 p-8 text-center min-h-[120px] flex flex-col justify-center items-center mt-4">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No records found</h3>
                <p className="text-gray-600 mb-1 text-sm">Try changing your search or filters to see more results.</p>
              </div>
            )}

            {/* Task Display - Hierarchical for Admin, Grid for others */}
            {user?.role === 'Admin' ? (
              // Hierarchical view for Admin
              <div className="space-y-6">
                {(() => {
                  const groupedTasks = groupTasksByTeamAndProject();
                  if (!groupedTasks) return null;
                  
                  return Object.values(groupedTasks)
                    .filter(group => Object.keys(group.projects).length > 0)
                    .map((group) => (
                      <div key={group.team._id} className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
                        {/* Team Header */}
                        <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <CheckSquare size={16} className="text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-green-800">{group.team.name}</h3>
                                <p className="text-sm text-green-600">
                                  {Object.values(group.projects).reduce((total, project) => total + project.tasks.length, 0)} tasks
                                </p>
                              </div>
                            </div>
                            {group.team.manager && (
                              <div className="text-right">
                                <p className="text-sm text-green-700 font-medium">Manager</p>
                                <p className="text-xs text-green-600">{group.team.manager.name}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Projects and Tasks */}
                        <div className="p-6 space-y-4">
                          {Object.values(group.projects)
                            .filter(project => project.tasks.length > 0)
                            .map((project) => {
                              const currentPage = projectPages[project.project._id] || 1;
                              const totalPages = Math.ceil(project.tasks.length / tasksPerPage);
                              const startIndex = (currentPage - 1) * tasksPerPage;
                              const endIndex = startIndex + tasksPerPage;
                              const currentTasks = project.tasks.slice(startIndex, endIndex);
                              
                              return (
                                <div key={project.project._id} className="bg-gray-50 rounded-lg p-4">
                                  {/* Project Header */}
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                                        <CheckSquare size={12} className="text-white" />
                                      </div>
                                      <h4 className="text-base font-semibold text-blue-800">{project.project.name}</h4>
                                      <span className="text-sm text-gray-600">({project.tasks.length} tasks)</span>
                                    </div>
                                  </div>
                                  
                                  {/* Tasks Grid */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentTasks.map((task) => (
                                      <div
                                        key={task._id}
                                        onClick={() => navigate(`/tasks/${task._id}`)}
                                        className="bg-white rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                                      >
                                        <div className="p-4">
                                          <div className="flex items-center justify-between mb-3">
                                            <div className="flex-1 min-w-0">
                                              <h5 className="text-base font-bold text-green-700 group-hover:text-green-800 transition-colors cursor-pointer truncate">
                                                {task.title}
                                              </h5>
                                              {task.description && (
                                                <p className="text-gray-600 text-xs mt-1 line-clamp-2">{task.description}</p>
                                              )}
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)} ml-3 flex-shrink-0`}>
                                              {task.status}
                                            </span>
                                          </div>
                                          
                                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div className="flex flex-col sm:flex-row gap-2">
                                              <div className="flex items-center gap-3 overflow-x-auto">
                                                <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                                                  <Clock size={14} className="text-green-500" />
                                                  <span className="font-medium">Due:</span>
                                                  <span className={task.dueDate ? 'text-red-600 font-medium' : 'text-gray-500'}>
                                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                                                  </span>
                                                </div>
                                                
                                                <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                                                  <CheckSquare size={14} className="text-green-500" />
                                                  <span className="font-medium">Priority:</span>
                                                  <span className={`font-medium ${
                                                    task.priority === 'High' ? 'text-red-600' : 
                                                    task.priority === 'Medium' ? 'text-yellow-600' : 
                                                    'text-green-600'
                                                  }`}>
                                                    {task.priority}
                                                  </span>
                                                </div>
                                              </div>
                                              
                                              <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                                                <span className="font-medium">Assigned:</span>
                                                <span className="truncate">
                                                  {Array.isArray(task.assignedTo) && task.assignedTo.length > 0
                                                    ? task.assignedTo.map((u) => u?.name).filter(Boolean).join(', ')
                                                    : 'Not Assigned'}
                                                </span>
                                              </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                              <Link
                                                to={`/tasks/${task._id}`}
                                                className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium text-xs shadow-md hover:shadow-lg justify-center"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <span>View Details</span>
                                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                              </Link>
                                              
                                              {user?.role === 'Manager' && (
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(task._id);
                                                  }}
                                                  className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-all duration-200 font-medium text-xs shadow-md hover:shadow-lg"
                                                  title="Delete Task"
                                                >
                                                  <Trash2 size={14} />
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {/* Pagination for each project */}
                                  {totalPages >= 1 && (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mt-3">
                                      <div className="flex items-center justify-between">
                                        <div className="text-xs text-gray-600">
                                          Showing {startIndex + 1} to {Math.min(endIndex, project.tasks.length)} of {project.tasks.length} tasks
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => handlePrevPage(null, project.project._id)}
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
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                              <button
                                                key={page}
                                                onClick={() => handleProjectPageChange(project.project._id, page)}
                                                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                                                  page === currentPage
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                              >
                                                {page}
                                              </button>
                                            ))}
                                          </div>
                                          
                                          <button
                                            onClick={() => handleNextPage(null, project.project._id, totalPages)}
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
                              );
                            })}
                        </div>
                      </div>
                    ));
                })()}
              </div>
            ) : (
              // Grid view for non-Admin users
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentTasks.length === 0 ? (
                  <div className="col-span-full bg-white rounded-xl shadow-lg border border-green-100 p-8 text-center min-h-[180px] flex flex-col justify-center items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckSquare size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Tasks Found</h3>
                    <p className="text-gray-600 mb-3">Try adjusting your filters or create a new task</p>
                    <Link
                      to="/add-task"
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                    >
                      <Plus size={16} />
                      Create Task
                    </Link>
                  </div>
                ) : (
                  currentTasks.map((task) => (
                    <div
                      key={task._id}
                      className="group relative bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Task Header with Gradient Background */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 
                              onClick={() => navigate(`/tasks/${task._id}`)}
                              className="text-lg font-bold text-gray-800 group-hover:text-green-700 transition-colors cursor-pointer line-clamp-2"
                            >
                              {task.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                              {getStatusIcon(task.status)}
                              <span>{task.status}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Project Badge */}
                        {task.project && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <Briefcase size={12} className="text-white" />
                            </div>
                            <span className="text-sm font-medium text-blue-700">
                              {task.project.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Task Content */}
                      <div className="p-6">
                        {/* Description */}
                        {task.description && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                              {task.description}
                            </p>
                          </div>
                        )}

                        {/* Task Details Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {/* Due Date */}
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                              <Clock size={14} className="text-orange-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Due Date</p>
                              <p className={`text-sm font-semibold ${
                                task.dueDate ? 'text-orange-600' : 'text-gray-400'
                              }`}>
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not Set'}
                              </p>
                            </div>
                          </div>

                          {/* Assigned To */}
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                              <Users size={14} className="text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Assigned To</p>
                              <p className="text-sm font-semibold text-gray-700 truncate">
                                {Array.isArray(task.assignedTo) && task.assignedTo.length > 0
                                  ? task.assignedTo.map((u) => u?.name).filter(Boolean).join(', ')
                                  : 'Unassigned'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Priority Badge */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs text-gray-500 font-medium">Priority:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            task.priority === 'High' 
                              ? 'bg-red-100 text-red-700 border border-red-200' 
                              : task.priority === 'Medium' 
                              ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
                              : 'bg-green-100 text-green-700 border border-green-200'
                          }`}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <button
                            onClick={() => navigate(`/tasks/${task._id}`)}
                            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg"
                          >
                            <span>View Details</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </button>

                          {user?.role === 'Manager' && (
                            <div className="flex items-center gap-2">
                              <Link 
                                to={`/tasks/${task._id}/edit`} 
                                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <PencilLine size={14} />
                                <span className="text-xs font-medium">Edit</span>
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(task);
                                }}
                                className="flex items-center gap-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                              >
                                <Trash2 size={14} />
                                <span className="text-xs font-medium">Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>


            )}


          </>
        )}

        {/* Tasks Pagination */}
        {filteredTasks.length > 0 && totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">
                Showing {indexOfFirstTask + 1} to {Math.min(indexOfLastTask, filteredTasks.length)} of {filteredTasks.length} tasks
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
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
                  onClick={() => handlePageChange(currentPage + 1)}
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
      </main>

      {/* Custom Delete Confirmation Dialog */}
      {showDeleteDialog && deleteTask && (
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
                Are you sure you want to delete the task{" "}
                <span className="font-semibold text-red-600">
                  "{deleteTask.title}"
                </span>?
              </p>
              <p className="text-sm text-gray-500 bg-red-50 p-3 rounded-lg border border-red-100">
                <span className="font-semibold text-red-700">Warning:</span> This action cannot be undone.
                All task data, comments, and attachments will be permanently deleted.
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
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-colors font-medium"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default TaskListPage;
