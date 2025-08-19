import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllProjects } from "../services/projectService";
import { useAuth } from "../context/AuthContext";
import AuthNavbar from "../components/AuthNavbar";
import Footer from "../components/Footer";
import { toast } from "react-hot-toast";
import { Briefcase, Calendar, Users, ArrowRight, Filter, X, ChevronDown, ArrowLeft, Trash2, AlertCircle } from 'lucide-react';
import axios from "axios";
import Select from 'react-select';
import { Clock, Loader2, CheckCircle } from 'lucide-react';

const API = process.env.REACT_APP_API_BASE_URL || 'https://taskpilot-o3bm.onrender.com/api';

function Projects() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [managers, setManagers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterManager, setFilterManager] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [teamPages, setTeamPages] = useState({});
  const [projectsPerPage] = useState(4);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteProject, setDeleteProject] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllProjects(token);
      let filteredProjects = [];
      
      if (user?.role === "Team Member") {
        filteredProjects = res.data.filter(project => 
          project.teamMembers?.some(member => 
            typeof member === "string" ? member === user._id : member._id === user._id
          )
        );
      } else if (user?.role === "Manager") {
        filteredProjects = res.data.filter(project => 
          project.teamMembers?.some(member => 
            typeof member === "string" ? member === user._id : member._id === user._id
          ) || 
          (project.projectManager && 
           (typeof project.projectManager === "string" ? 
            project.projectManager === user._id : 
            project.projectManager._id === user._id))
        );
      } else {
        filteredProjects = res.data;
      }
      
      filteredProjects.sort((a, b) => {
        const dateA = new Date(a.createdAt || a._id);
        const dateB = new Date(b.createdAt || b._id);
        return dateB - dateA;
      });
      
      setProjects(filteredProjects);
    } catch (err) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [token, user?.role, user?._id]);

  useEffect(() => {
    if (token && user) {
      loadProjects();
    }
  }, [token, user, loadProjects]);

  const fetchManagers = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/users/managers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setManagers(response.data);
    } catch (error) {
      // Error handling without console logging
    }
  }, [token]);

  const fetchTeams = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams(response.data);
    } catch (error) {
      // Error handling without console logging
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchManagers();
      // Only fetch teams for Admin users
      if (user?.role === 'Admin') {
      fetchTeams();
    }
    }
  }, [fetchManagers, fetchTeams, user?.role]);



  const groupProjectsByTeam = () => {
    if (user?.role !== 'Admin') {
      return null;
    }

    const groupedProjects = {};
    
    teams.forEach(team => {
      groupedProjects[team._id] = {
        team: team,
        projects: []
      };
    });

    groupedProjects['unassigned'] = {
      team: { name: 'Unassigned Projects', _id: 'unassigned' },
      projects: []
    };

    filteredProjects.forEach(project => {
      let assignedToTeam = false;
      
      teams.forEach(team => {
        if (project.projectManager) {
          const projectManagerId = typeof project.projectManager === 'string' 
            ? project.projectManager 
            : project.projectManager._id;
          
          if (team.manager && team.manager._id === projectManagerId) {
            if (!groupedProjects[team._id]) {
              groupedProjects[team._id] = { team: team, projects: [] };
            }
            groupedProjects[team._id].projects.push(project);
            assignedToTeam = true;
          }
        }
      });

      if (!assignedToTeam) {
        groupedProjects['unassigned'].projects.push(project);
      }
    });

    return groupedProjects;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteProject = (project) => {
    setDeleteProject(project);
    setShowDeleteDialog(true);
  };

  const confirmDeleteProject = async () => {
    if (!deleteProject) return;
    
    try {
      await axios.delete(`${API}/projects/${deleteProject._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Project deleted successfully');
      loadProjects(); // Reload the projects list
    } catch (error) {
      // Error handling without console logging
      toast.error('Failed to delete project');
    } finally {
      setShowDeleteDialog(false);
      setDeleteProject(null);
    }
  };

  const cancelDeleteProject = () => {
    setShowDeleteDialog(false);
    setDeleteProject(null);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterManager('');
    setFilterTeam('');
    setFilterStatus('');
  };

  const handlePageChange = (teamId, pageNumber) => {
    setTeamPages(prev => ({
      ...prev,
      [teamId]: pageNumber
    }));
  };

  const handleNextPage = (teamId, totalPages) => {
    setTeamPages(prev => ({
      ...prev,
      [teamId]: Math.min((prev[teamId] || 1) + 1, totalPages)
    }));
  };

  const handlePrevPage = (teamId) => {
    setTeamPages(prev => ({
      ...prev,
      [teamId]: Math.max((prev[teamId] || 1) - 1, 1)
    }));
  };

  // Filter projects based on search term, manager, team, and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchTerm === '' || 
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectManager?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesManager = filterManager === '' || 
      (project.projectManager && 
       (typeof project.projectManager === 'string' ? 
        project.projectManager === filterManager : 
        project.projectManager._id === filterManager));
    
    const matchesTeam = filterTeam === '' || 
      (project.teamMembers && project.teamMembers.some(member => {
        const memberId = typeof member === 'string' ? member : member._id;
        const teamMembers = teams.find(team => team._id === filterTeam)?.members || [];
        return teamMembers.some(teamMember => teamMember._id === memberId);
      }));
    
    const matchesStatus = filterStatus === '' || project.status === filterStatus;
    
    return matchesSearch && matchesManager && matchesTeam && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
      <AuthNavbar />
      <main className="max-w-7xl mx-auto px-3 py-4 flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Briefcase size={20} className="text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Loading Projects</h3>
              <p className="text-gray-600 text-sm">Fetching your project data...</p>
            </div>
            <div className="flex space-x-1 mt-3">
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
                     <Briefcase size={20} className="text-white" />
                   </div>
                   <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                     Projects
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
                     Projects
                   </h1>
                 </div>
               </div>
             </div>
             
             <div className="text-center mb-3">
               <p className="text-base text-gray-600 max-w-2xl mx-auto">
                 {user?.role === "Admin" 
                   ? "Monitor and manage projects across all teams"
                   : "Track and manage your assigned projects"
                 }
               </p>
             </div>

                         {/* Create Project Button and Filters Toggle Button */}
             <div className="flex justify-between items-center mb-4">
               {user?.role === "Manager" && (
                 <Link
                   to="/projects/create"
                   className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-sm"
                 >
                   <Briefcase size={18} />
                   Add New Project
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
                  <h3 className="text-base font-semibold text-gray-800">Filter Projects</h3>
                  <button
                    onClick={handleResetFilters}
                    className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Reset Filters
                  </button>
                </div>
                <div className={`grid gap-3 ${user?.role === "Admin" ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>
                  <input
                    type="text"
                    placeholder="Search Projects"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />

                  {/* Filter by Manager - Only for Admin */}
                  {user?.role === "Admin" && (
                    <Select
                      value={filterManager ? {
                        value: filterManager,
                        label: managers.find(m => m._id === filterManager)?.name || 'Unknown',
                        profilePicture: managers.find(m => m._id === filterManager)?.profilePicture || '/default_avatar.jpg',
                      } : null}
                      onChange={option => setFilterManager(option ? option.value : '')}
                      options={[
                        { value: '', label: 'Filter by Manager', isDisabled: true },
                        ...managers.map(manager => ({
                          value: manager._id,
                          label: manager.name,
                          profilePicture: manager.profilePicture || '/default_avatar.jpg',
                        }))
                      ]}
                      isSearchable={true}
                      placeholder="Filter by Manager"
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
                            <img
                              src={option.profilePicture || '/default_avatar.jpg'}
                              alt={option.profilePicture || 'no-image'}
                              className="w-7 h-7 rounded-full object-cover border border-gray-200 bg-white"
                              onError={e => { e.target.onerror = null; e.target.src = '/default_avatar.jpg'; }}
                            />
                            <span>{option.label}</span>
                          </span>
                        )
                      }
                    />
                  )}

                  {/* Filter by Team - Only for Admin */}
                  {user?.role === "Admin" && (
                    <Select
                      value={filterTeam ? {
                        value: filterTeam,
                        label: teams.find(t => t._id === filterTeam)?.name || 'Unknown',
                      } : null}
                      onChange={option => setFilterTeam(option ? option.value : '')}
                      options={[
                        { value: '', label: 'Filter by Team', isDisabled: true },
                        ...teams.map(team => ({ value: team._id, label: team.name }))
                      ]}
                      isSearchable={true}
                      placeholder="Filter by Team"
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
                          <span className="flex items-center gap-2 px-2 py-1 rounded">{option.label}</span>
                        )
                      }
                    />
                  )}

                  {/* Filter by Status - For Manager role */}
                  {user?.role === "Manager" && (
                    <Select
                      value={filterStatus ? {
                        value: filterStatus,
                        label: filterStatus,
                      } : null}
                      onChange={option => setFilterStatus(option ? option.value : '')}
                      options={[
                        { value: '', label: 'Filter by Status', isDisabled: true },
                        { value: 'Pending', label: 'Pending', icon: <Clock size={16} className="text-yellow-500" />, color: 'bg-yellow-100 text-yellow-800' },
                        { value: 'In Progress', label: 'In Progress', icon: <Loader2 size={16} className="text-blue-500 animate-spin" />, color: 'bg-blue-100 text-blue-800' },
                        { value: 'Completed', label: 'Completed', icon: <CheckCircle size={16} className="text-green-500" />, color: 'bg-green-100 text-green-800' },
                      ]}
                      isSearchable={false}
                      placeholder="Filter by Status"
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
                          <span className={`flex items-center gap-2 px-2 py-1 rounded ${option.color}`}>
                            {option.icon}
                            <span>{option.label}</span>
                          </span>
                        )
                      }
                    />
                  )}
                </div>

                {/* Active Filters Display */}
                {(searchTerm || filterManager || filterTeam || filterStatus) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
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
                      {filterManager && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          Manager: {managers.find(m => m._id === filterManager)?.name || 'Unknown'}
                          <button
                            onClick={() => setFilterManager('')}
                            className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
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
                      {filterStatus && (
                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          Status: {filterStatus}
                          <button
                            onClick={() => setFilterStatus('')}
                            className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
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

            {/* Remove the No records found message. Do not show any empty state message. */}

            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg border border-green-100 p-8 text-center min-h-[180px] flex flex-col justify-center items-center">
                <Briefcase size={48} className="text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Projects Found</h3>
                <p className="text-gray-600 mb-3 text-sm">
                  {user?.role === "Admin" ? "No projects found in the system" :
                    user?.role === "Manager" ? "No projects have been assigned to you yet" :
                    "No projects found"}
                </p>
                {user?.role === "Manager" && (
                  <Link
                    to="/projects/create"
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    <Briefcase size={16} />
                    Create Project
                  </Link>
                )}
              </div>
            ) : (
              <>
                                 {user?.role === 'Admin' ? (
                   <div className="space-y-6">
                     {(() => {
                       const groupedProjects = groupProjectsByTeam();
                       if (!groupedProjects) return null;
                       
                       return Object.values(groupedProjects)
                         .filter(group => group.projects.length > 0)
                         .map((group) => {
                           const currentPage = teamPages[group.team._id] || 1;
                           const totalPages = Math.ceil(group.projects.length / projectsPerPage);
                           const startIndex = (currentPage - 1) * projectsPerPage;
                           const endIndex = startIndex + projectsPerPage;
                           const currentProjects = group.projects.slice(startIndex, endIndex);
                           
                           return (
                             <div key={group.team._id} className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
                               <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
                                 <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                       <Users size={16} className="text-white" />
                                     </div>
                                     <div>
                                       <h3 className="text-lg font-bold text-green-800">{group.team.name}</h3>
                                       <p className="text-sm text-green-600">
                                         {group.projects.length} project{group.projects.length !== 1 ? 's' : ''}
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
                               
                               <div className="p-6">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {currentProjects.map((project) => (
                                     <div
                                       key={project._id}
                                       className="bg-white rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                                     >
                                       <div className="p-4">
                                         <div className="flex items-center justify-between mb-3">
                                           <div className="flex-1 min-w-0">
                                             <Link
                                               to={`/projects/${project._id}`}
                                               className="group-hover:text-green-800 transition-colors"
                                             >
                                               <h2 className="text-base font-bold text-green-700 group-hover:text-green-800 transition-colors cursor-pointer truncate">
                                                 {project.name}
                                               </h2>
                                             </Link>
                                             <p className="text-gray-600 text-xs mt-1 line-clamp-2">{project.description}</p>
                                           </div>
                                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} ml-3 flex-shrink-0`}>
                                             {project.status}
                                           </span>
                                         </div>
                                         
                                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                           <div className="flex flex-col sm:flex-row gap-2">
                                             <div className="flex items-center gap-3 overflow-x-auto">
                                               <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                                                 <Calendar size={14} className="text-green-500" />
                                                 <span className="font-medium">Due:</span>
                                                 <span>{project.deadline?.slice(0, 10) || "N/A"}</span>
                                               </div>
                                               
                                               <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                                                 <Users size={14} className="text-green-500" />
                                                 <span className="font-medium">Team:</span>
                                                 <span>{project.teamMembers?.length || 0} members</span>
                                               </div>
                                             </div>
                                             
                                             <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                                               <Briefcase size={14} className="text-green-500" />
                                               <span className="font-medium">Manager:</span>
                                               <span>{project.projectManager?.name || "Not Assigned"}</span>
                                             </div>
                                           </div>
                                           
                                           <div className="flex items-center gap-2">
                                             <Link
                                               to={`/projects/${project._id}`}
                                               className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium text-xs shadow-md hover:shadow-lg justify-center"
                                             >
                                               <span>View Details</span>
                                               <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                             </Link>
                                             
                                             {user?.role === 'Manager' && (
                                               <button
                                                 onClick={() => handleDeleteProject(project)}
                                                 className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-all duration-200 font-medium text-xs shadow-md hover:shadow-lg"
                                                 title="Delete Project"
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
                                 
                                                                                                     {/* Pagination Controls for each team */}
                                  {totalPages >= 1 && (
                                    <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4 mt-4">
                                      <div className="flex items-center justify-between">
                                        <div className="text-xs text-gray-600">
                                          Showing {startIndex + 1} to {Math.min(endIndex, group.projects.length)} of {group.projects.length} projects
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => handlePrevPage(group.team._id)}
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
                                                onClick={() => handlePageChange(group.team._id, page)}
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
                                            onClick={() => handleNextPage(group.team._id, totalPages)}
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
                             </div>
                           );
                         });
                     })()}
                   </div>
                 ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProjects.map((project) => (
                      <div
                        key={project._id}
                        className="bg-white rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/projects/${project._id}`}
                                className="group-hover:text-green-800 transition-colors"
                              >
                                <h2 className="text-base font-bold text-green-700 group-hover:text-green-800 transition-colors cursor-pointer truncate">
                                  {project.name}
                                </h2>
                              </Link>
                              <p className="text-gray-600 text-xs mt-1 line-clamp-2">{project.description}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} ml-3 flex-shrink-0`}>
                              {project.status}
                            </span>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <div className="flex items-center gap-3 overflow-x-auto">
                                <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                                  <Calendar size={14} className="text-green-500" />
                                  <span className="font-medium">Due:</span>
                                  <span>{project.deadline?.slice(0, 10) || "N/A"}</span>
                                </div>
                                
                                <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                                  <Users size={14} className="text-green-500" />
                                  <span className="font-medium">Team:</span>
                                  <span>{project.teamMembers?.length || 0} members</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                                <Briefcase size={14} className="text-green-500" />
                                <span className="font-medium">Manager:</span>
                                <span>{project.projectManager?.name || "Not Assigned"}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/projects/${project._id}`}
                                className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium text-xs shadow-md hover:shadow-lg justify-center"
                              >
                                <span>View Details</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                              </Link>
                              
                              {user?.role === 'Manager' && (
                                <button
                                  onClick={() => handleDeleteProject(project)}
                                  className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-all duration-200 font-medium text-xs shadow-md hover:shadow-lg"
                                  title="Delete Project"
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
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Custom Delete Confirmation Dialog */}
      {showDeleteDialog && deleteProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Dialog Header */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete Project</h3>
                <p className="text-sm text-gray-600">Confirm project deletion</p>
              </div>
            </div>

            {/* Dialog Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the project{" "}
                <span className="font-semibold text-red-600">
                  "{deleteProject.name}"
                </span>?
              </p>
              <p className="text-sm text-gray-500 bg-red-50 p-3 rounded-lg border border-red-100">
                <span className="font-semibold text-red-700">Warning:</span> This action cannot be undone. 
                All project data, tasks, and team assignments will be permanently deleted.
              </p>
            </div>

            {/* Dialog Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={cancelDeleteProject}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProject}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-colors font-medium"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Projects;
