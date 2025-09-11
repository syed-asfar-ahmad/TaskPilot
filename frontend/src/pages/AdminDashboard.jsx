import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Navbar from "../components/AuthNavbar";
import Footer from "../components/Footer";
import { toast } from 'react-hot-toast'; 
import UserProfileWidget from "../components/UserProfileWidget";
import Select from "react-select";

import {
  BarChart,
  FilePlus,
  ListTodo,
  Users,
  PlusCircle,
  ClipboardList,
  Briefcase,
  Calendar,
  ArrowRight,
  CheckSquare,
  Mail,
  X,
  FileText,
  UserCheck,
  Info,
} from "lucide-react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const API = process.env.REACT_APP_API_BASE_URL || 'https://taskpilot-1-mzxb.onrender.com/api';

function AdminDashboard() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [contactCount, setContactCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentTasksPage, setCurrentTasksPage] = useState(1);
  const [currentTeamsPage, setCurrentTeamsPage] = useState(1);
  const [tasksPerPage] = useState(4);
  const [teamsPerPage] = useState(4);

  // Team management states
  const [teams, setTeams] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [createTeamForm, setCreateTeamForm] = useState({
    name: '',
    description: '',
    managerId: ''
  });



  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projRes, taskRes, memberRes, contactRes, teamsRes, usersRes, managersRes] = await Promise.all([
          axios.get(`${API}/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/users/team-members`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/contact/admin`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/teams`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/teams/available-users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/teams/managers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setProjects(projRes.data);
        setTasks(taskRes.data);
        setMembers(memberRes.data);
        setContactCount(contactRes.data.length);
        setTeams(teamsRes.data);
        setAvailableUsers(usersRes.data);
        setManagers(managersRes.data);
      } catch (err) {
        toast.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);



  // Group projects by team
  const groupProjectsByTeam = () => {
    const teamProjects = {};
    
    projects.forEach(project => {
      // Get team members from this project
      const teamMemberIds = project.teamMembers?.map(member => 
        typeof member === 'string' ? member : member._id
      ) || [];
      
      // Find which team these members belong to
      let projectTeam = null;
      
      teams.forEach(team => {
        const teamMembers = members.filter(member => member.teamId === team._id);
        const teamMemberIds = teamMembers.map(member => member._id);
        
        // Check if any project member is in this team
        const hasCommonMember = teamMemberIds.some(id => teamMemberIds.includes(id));
        if (hasCommonMember) {
          projectTeam = team;
        }
      });
      
      // Only add projects that belong to actual teams
      if (projectTeam) {
        const teamName = projectTeam.name;
        
        if (!teamProjects[teamName]) {
          teamProjects[teamName] = [];
        }
        teamProjects[teamName].push(project);
      }
    });
    
    return teamProjects;
  };

  const groupTasksByTeam = () => {
    const teamTasks = {};
    
    tasks.forEach(task => {
      // Get the assigned user ID
      const assignedUserId = typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo?._id;
      
      // Find which team this user belongs to
      let taskTeam = null;
      
      teams.forEach(team => {
        const teamMembers = members.filter(member => member.teamId === team._id);
        const teamMemberIds = teamMembers.map(member => member._id);
        
        // Check if the assigned user is in this team
        if (teamMemberIds.includes(assignedUserId)) {
          taskTeam = team;
        }
      });
      
      // Only add tasks that belong to actual teams
      if (taskTeam) {
        const teamName = taskTeam.name;
        
        if (!teamTasks[teamName]) {
          teamTasks[teamName] = [];
        }
        teamTasks[teamName].push(task);
      }
    });
    
    return teamTasks;
  };

  const teamProjects = groupProjectsByTeam();
  const teamNames = Object.keys(teamProjects);
  const teamTasks = groupTasksByTeam();
  const teamTaskNames = Object.keys(teamTasks);

  // Pagination logic for tasks
  const indexOfLastTask = currentTasksPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalTasksPages = Math.ceil(tasks.length / tasksPerPage);

  // Pagination logic for teams
  const sortedTeams = teams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const indexOfLastTeam = currentTeamsPage * teamsPerPage;
  const indexOfFirstTeam = indexOfLastTeam - teamsPerPage;
  const currentTeams = sortedTeams.slice(indexOfFirstTeam, indexOfLastTeam);
  const totalTeamsPages = Math.ceil(teams.length / teamsPerPage);

  const handleTasksPageChange = (pageNumber) => {
    setCurrentTasksPage(pageNumber);
  };

  const handleTeamsPageChange = (pageNumber) => {
    setCurrentTeamsPage(pageNumber);
  };

  // Team management functions
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/teams`, createTeamForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success('Team created successfully!');
      setTeams([...teams, response.data.team]);
      setShowCreateTeamModal(false);
      setCreateTeamForm({ name: '', description: '', managerId: '' });
      
      // Refresh available users and managers
      const [usersRes, managersRes] = await Promise.all([
        axios.get(`${API}/teams/available-users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/teams/managers`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);
      setAvailableUsers(usersRes.data);
      setManagers(managersRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    }
  };



  // Format managers for React Select
  const managerOptions = managers.map((manager) => ({
    value: manager._id,
    label: manager.name,
    email: manager.email,
    profilePicture: manager.profilePicture || null
  }));

  const handleManagerChange = (selectedOption) => {
    setCreateTeamForm({ ...createTeamForm, managerId: selectedOption ? selectedOption.value : '' });
  };

  const handleAddMemberToTeam = async (teamId, memberId) => {
    try {
      await axios.post(`${API}/teams/${teamId}/members`, { memberId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success('Member added to team successfully!');
      
      // Refresh teams and available users
      const [teamsRes, usersRes] = await Promise.all([
        axios.get(`${API}/teams`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/teams/available-users`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setTeams(teamsRes.data);
      setAvailableUsers(usersRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMemberFromTeam = async (teamId, memberId) => {
    try {
      await axios.delete(`${API}/teams/${teamId}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success('Member removed from team successfully!');
      
      // Refresh teams and available users
      const [teamsRes, usersRes] = await Promise.all([
        axios.get(`${API}/teams`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/teams/available-users`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setTeams(teamsRes.data);
      setAvailableUsers(usersRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

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

  const getTaskStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'to do':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Task Status Counts
  const statusCounts = tasks.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    },
    { "To Do": 0, "In Progress": 0, Completed: 0 }
  );

  const taskStatusData = {
    labels: ["To Do", "In Progress", "Completed"],
    datasets: [
      {
        label: "Tasks by Status",
        data: [
          statusCounts["To Do"],
          statusCounts["In Progress"],
          statusCounts["Completed"],
        ],
        backgroundColor: ["#facc15", "#38bdf8", "#4ade80"],
        borderWidth: 1,
      },
    ],
  };

  // Correct task count logic for assignedTo (which is an array)
  const getTaskCount = (memberId) => {
    return tasks.filter((task) => {
      const assignedList = task.assignedTo;
      if (!Array.isArray(assignedList)) return false;

      return assignedList.some(
        (assigned) => assigned === memberId || assigned._id === memberId
      );
    }).length;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-3 py-4 flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 min-h-[60vh]">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart size={20} className="text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Loading Dashboard</h3>
              <p className="text-gray-600 text-sm">Fetching your dashboard data...</p>
            </div>
            <div className="flex space-x-1 mt-3">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        ) : (
          <>
            {/* Header with Title - Styled like other pages */}
            <div className="mb-4">
              <div className="text-center">
                <div className="inline-flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center">
                    <BarChart size={20} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                </div>
              </div>
              
              <div className="text-center mb-3">
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                  Monitor and manage your project ecosystem
                </p>
              </div>
            </div>

            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                                               {/* Total Projects Card */}
                 <div className="group relative bg-gradient-to-br from-white to-green-50 p-4 rounded-xl shadow-lg border border-green-200 hover:shadow-xl hover:scale-102 transition-all duration-300 overflow-hidden">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 opacity-10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
                   <div className="relative z-10">
                     <div className="flex items-center justify-between mb-3">
                       <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg flex items-center justify-center">
                         <Briefcase size={20} className="text-white" />
                  </div>
                       <div className="text-right">
                         <div className="text-2xl font-bold text-gray-800 group-hover:text-green-700 transition-colors duration-300">
                           {projects.length}
                  </div>
                       </div>
                     </div>
                     <div className="space-y-1">
                       <h3 className="text-base font-semibold text-gray-800">Total Projects</h3>
                       <p className="text-xs text-gray-600">Active project management</p>
                     </div>
                     <Link
                       to="/projects"
                       className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium text-xs shadow-lg hover:shadow-xl w-full justify-center group-hover:scale-105"
                     >
                       <Briefcase size={14} />
                       View Projects
                     </Link>
                </div>
              </div>

                 {/* Total Tasks Card */}
                 <div className="group relative bg-gradient-to-br from-white to-blue-50 p-4 rounded-xl shadow-lg border border-blue-200 hover:shadow-xl hover:scale-102 transition-all duration-300 overflow-hidden">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 opacity-10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
                   <div className="relative z-10">
                     <div className="flex items-center justify-between mb-3">
                       <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg flex items-center justify-center">
                         <ClipboardList size={20} className="text-white" />
                  </div>
                       <div className="text-right">
                         <div className="text-2xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                           {tasks.length}
                  </div>
                       </div>
                     </div>
                     <div className="space-y-1">
                       <h3 className="text-base font-semibold text-gray-800">Total Tasks</h3>
                       <p className="text-xs text-gray-600">Task tracking & management</p>
                     </div>
                     <Link
                       to="/tasks"
                       className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium text-xs shadow-lg hover:shadow-xl w-full justify-center group-hover:scale-105"
                     >
                       <ClipboardList size={14} />
                       View Tasks
                     </Link>
                </div>
              </div>

                 {/* Total Members Card */}
                 <div className="group relative bg-gradient-to-br from-white to-purple-50 p-4 rounded-xl shadow-lg border border-purple-200 hover:shadow-xl hover:scale-102 transition-all duration-300 overflow-hidden">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 opacity-10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
                   <div className="relative z-10">
                     <div className="flex items-center justify-between mb-3">
                       <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center">
                         <Users size={20} className="text-white" />
                  </div>
                       <div className="text-right">
                         <div className="text-2xl font-bold text-gray-800 group-hover:text-purple-700 transition-colors duration-300">
                           {members.length}
                  </div>
                       </div>
                     </div>
                     <div className="space-y-1">
                       <h3 className="text-base font-semibold text-gray-800">Team Members</h3>
                       <p className="text-xs text-gray-600">Collaborative workforce</p>
                     </div>
                     <Link
                       to="/members"
                       className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1.5 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium text-xs shadow-lg hover:shadow-xl w-full justify-center group-hover:scale-105"
                     >
                       <Users size={14} />
                       View Members
                     </Link>
                </div>
              </div>

                               {/* Contact Messages Card */}
                                 <div className="group relative bg-gradient-to-br from-white to-orange-50 p-4 rounded-xl shadow-lg border border-orange-200 hover:shadow-xl hover:scale-102 transition-all duration-300 overflow-hidden">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 opacity-10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
                   <div className="relative z-10">
                     <div className="flex items-center justify-between mb-3">
                       <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg flex items-center justify-center">
                         <Mail size={20} className="text-white" />
                       </div>
                       <div className="text-right">
                         <div className="text-2xl font-bold text-gray-800 group-hover:text-orange-700 transition-colors duration-300">
                           {contactCount}
                  </div>
                  </div>
                </div>
                     <div className="space-y-1">
                       <h3 className="text-base font-semibold text-gray-800">Contact Messages</h3>
                       <p className="text-xs text-gray-600">Customer inquiries</p>
                     </div>
                <Link
                  to="/contact-messages"
                       className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium text-xs shadow-lg hover:shadow-xl w-full justify-center group-hover:scale-105"
                >
                  <Mail size={14} />
                  View Messages
                </Link>
                   </div>
                 </div>

                 {/* Total Teams Card */}
                 <div className="group relative bg-gradient-to-br from-white to-indigo-50 p-4 rounded-xl shadow-lg border border-indigo-200 hover:shadow-xl hover:scale-102 transition-all duration-300 overflow-hidden">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 opacity-10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
                   <div className="relative z-10">
                     <div className="flex items-center justify-between mb-3">
                       <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg flex items-center justify-center">
                         <Users size={20} className="text-white" />
                       </div>
                       <div className="text-right">
                         <div className="text-2xl font-bold text-gray-800 group-hover:text-indigo-700 transition-colors duration-300">
                           {teams.length}
                         </div>
                       </div>
                     </div>
                     <div className="space-y-1">
                       <h3 className="text-base font-semibold text-gray-800">Total Teams</h3>
                       <p className="text-xs text-gray-600">Organized teams</p>
                     </div>
                     <button
                       onClick={() => {
                         // Scroll to teams section instead of opening create modal
                         const teamsSection = document.getElementById('teams-section');
                         if (teamsSection) {
                           teamsSection.scrollIntoView({ behavior: 'smooth' });
                         }
                       }}
                       className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-3 py-1.5 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 font-medium text-xs shadow-lg hover:shadow-xl w-full justify-center group-hover:scale-105"
                     >
                       <Users size={14} />
                       Manage Teams
                     </button>
                   </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-4 mb-6 min-w-0 overflow-hidden">
              {/* Pie Chart */}
              <div className="bg-white p-4 rounded-xl shadow-lg border border-green-100 md:h-[300px] h-[240px] flex flex-col overflow-hidden w-full min-w-0 max-w-full">
                <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <ClipboardList size={18} className="text-green-600" /> Task Status Overview
                </h2>
                <div className="flex-grow relative w-full min-w-0 h-full">
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0">
                      <Pie
                        data={taskStatusData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                boxWidth: 10,
                                padding: 12,
                              },
                            },
                          },
                        }}
                        style={{ width: '100% !important', height: '100% !important', maxWidth: '100%', maxHeight: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Task counts per team member (list) */}
              <div className="bg-white p-4 rounded-xl shadow-lg border border-green-100 h-[300px] overflow-y-auto">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Users size={18} className="text-green-600" /> Team Members
                  </h2>
                  <Link
                    to="/members"
                    className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition duration-200"
                  >
                    View All
                  </Link>
                </div>

                <ul className="space-y-2 text-xs text-gray-700">
                  {members.map((member) => {
                    const count = getTaskCount(member._id);
                    return (
                      <li
                        key={member._id}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        <span className="font-medium">{member.name}</span>
                        <Link
                          to={`/tasks?assignedTo=${member._id}`}
                          className="text-green-600 hover:text-green-800 font-medium bg-green-100 px-2 py-0.5 rounded-full text-xs hover:bg-green-200 transition-colors"
                        >
                          {count} task{count !== 1 ? "s" : ""}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Projects Section */}
            <section className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-white p-1.5 rounded-full shadow-lg border border-green-100">
                    <Briefcase size={20} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Recent Projects</h2>
                </div>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-sm"
                >
                  <ArrowRight size={18} />
                  View All Projects
                </Link>
              </div>
              
              {projects.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg border border-green-100 p-8 text-center min-h-[180px] flex flex-col justify-center items-center">
                  <Briefcase size={48} className="text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Projects Found</h3>
                  <p className="text-gray-600 mb-3 text-sm">No projects have been created yet</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {projects.slice(0, 4).map((project) => (
                      <div
                        key={project._id}
                        className="bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden group"
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <Link
                                to={`/projects/${project._id}`}
                                className="group-hover:text-green-800 transition-colors"
                              >
                                <h4 className="text-base font-bold text-gray-700 group-hover:text-green-800 transition-colors cursor-pointer">
                                  {project.name}
                                </h4>
                              </Link>
                              <p className="text-gray-600 text-xs mt-1 line-clamp-2">{project.description}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} ml-3`}>
                              {project.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Calendar size={14} className="text-green-500" />
                                <span className="font-medium">Due:</span>
                                <span>{project.deadline?.slice(0, 10) || "N/A"}</span>
                              </div>
                            </div>
                            
                            <Link
                              to={`/projects/${project._id}`}
                              className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium text-xs shadow-md hover:shadow-lg"
                            >
                              <span>View Details</span>
                              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {projects.length > 4 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Link
                        to="/projects"
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium text-sm transition-colors"
                      >
                        <span>View {projects.length - 4} more projects</span>
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Tasks Section */}
            <section className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-white p-1.5 rounded-full shadow-lg border border-green-100">
                    <CheckSquare size={20} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Recent Tasks</h2>
                </div>
                <Link
                  to="/tasks"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-sm"
                >
                  <ArrowRight size={18} />
                  View All Tasks
                </Link>
              </div>
              
              {tasks.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg border border-green-100 p-8 text-center min-h-[180px] flex flex-col justify-center items-center">
                  <CheckSquare size={48} className="text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Tasks Found</h3>
                  <p className="text-gray-600 mb-3 text-sm">No tasks have been created yet</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {tasks.slice(0, 4).map((task) => (
                      <div
                        key={task._id}
                        className="bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden group"
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <Link
                                to={`/tasks/${task._id}`}
                                className="group-hover:text-green-800 transition-colors"
                              >
                                <h4 className="text-base font-bold text-gray-700 group-hover:text-green-800 transition-colors cursor-pointer">
                                  {task.title}
                                </h4>
                              </Link>
                              <p className="text-gray-600 text-xs mt-1 line-clamp-2">{task.description}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)} ml-3`}>
                              {task.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Calendar size={14} className="text-green-500" />
                                <span className="font-medium">Due:</span>
                                <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Due Date"}</span>
                              </div>
                            </div>
                            
                            <Link
                              to={`/tasks/${task._id}`}
                              className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium text-xs shadow-md hover:shadow-lg"
                            >
                              <span>View Details</span>
                              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {tasks.length > 4 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Link
                        to="/tasks"
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium text-sm transition-colors"
                      >
                        <span>View {tasks.length - 4} more tasks</span>
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Team Management Section */}
            <section id="teams-section" className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-white p-1.5 rounded-full shadow-lg border border-green-100">
                    <Users size={20} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Team Management</h2>
                </div>
                <button
                  onClick={() => setShowCreateTeamModal(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-sm"
                >
                  <PlusCircle size={18} />
                  Create Team
                </button>
              </div>
              
              {teams.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg border border-green-100 p-8 text-center min-h-[180px] flex flex-col justify-center items-center">
                  <Users size={48} className="text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Teams Created</h3>
                  <p className="text-gray-600 mb-3 text-sm">Create your first team to get started</p>
                  <button
                    onClick={() => setShowCreateTeamModal(true)}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    <PlusCircle size={16} />
                    Create Team
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 md:grid-cols-2">
                    {currentTeams.map((team) => (
                      <div
                        key={team._id}
                        className="bg-white rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                      >
                        <div className="p-4">
                          <div className="mb-3">
                            <div className="flex-1">
                              <Link
                                to={`/teams/${team._id}`}
                                className="group-hover:text-green-800 transition-colors"
                              >
                                <h3 className="text-lg font-bold text-green-700 group-hover:text-green-800 transition-colors cursor-pointer">
                                  {team.name}
                                </h3>
                              </Link>
                              <p className="text-gray-600 text-xs mt-1 line-clamp-2">{team.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Users size={14} className="text-green-500" />
                                <span className="font-medium">Members:</span>
                                <span>{team.members?.length || 0}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <span className="font-medium">Manager:</span>
                                <span>{team.manager?.name || 'Not assigned'}</span>
                              </div>
                            </div>
                            
                            <Link
                              to={`/teams/${team._id}`}
                              className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium text-xs shadow-md hover:shadow-lg"
                            >
                              <span>View Details</span>
                              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Teams Pagination */}
                  <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        Showing {indexOfFirstTeam + 1} to {Math.min(indexOfLastTeam, teams.length)} of {teams.length} teams
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTeamsPageChange(currentTeamsPage - 1)}
                          disabled={currentTeamsPage === 1}
                          className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                            currentTeamsPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          Previous
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalTeamsPages }, (_, index) => index + 1).map((pageNumber) => (
                            <button
                              key={pageNumber}
                              onClick={() => handleTeamsPageChange(pageNumber)}
                              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                                currentTeamsPage === pageNumber
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => handleTeamsPageChange(currentTeamsPage + 1)}
                          disabled={currentTeamsPage === totalTeamsPages}
                          className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                            currentTeamsPage === totalTeamsPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* Create Team Modal */}
            {showCreateTeamModal && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300 scale-100">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                          <Users size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Create New Team</h3>
                          <p className="text-green-100 text-sm">Build your dream team</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowCreateTeamModal(false)}
                        className="bg-white bg-opacity-20 p-2 rounded-xl hover:bg-opacity-30 transition-all duration-200"
                      >
                        <X size={20} className="text-white" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Form */}
                  <div className="p-6">
                    <form onSubmit={handleCreateTeam} className="space-y-6">
                      {/* Team Name */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Team Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Users size={18} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            required
                            value={createTeamForm.name}
                            onChange={(e) => setCreateTeamForm({...createTeamForm, name: e.target.value})}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                            placeholder="Enter team name"
                          />
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute top-3 left-4 pointer-events-none">
                            <FileText size={18} className="text-gray-400" />
                          </div>
                          <textarea
                            required
                            value={createTeamForm.description}
                            onChange={(e) => setCreateTeamForm({...createTeamForm, description: e.target.value})}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                            rows="3"
                            placeholder="Enter team description"
                          />
                        </div>
                      </div>
                      
                      {/* Manager Assignment */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Assign Manager <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={managerOptions.find(option => option.value === createTeamForm.managerId)}
                          onChange={handleManagerChange}
                          options={managerOptions}
                          placeholder="Select manager..."
                          className="react-select-container"
                          classNamePrefix="react-select"
                          menuPortalTarget={document.body}
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              minHeight: '48px',
                              border: state.isFocused ? '2px solid #16a34a' : '1px solid #d1d5db',
                              borderRadius: '12px',
                              boxShadow: state.isFocused ? '0 0 0 3px rgba(22, 163, 74, 0.1)' : 'none',
                              cursor: 'pointer',
                              backgroundColor: '#f9fafb',
                              fontSize: '14px',
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
                              fontSize: '14px',
                              '&:hover': {
                                backgroundColor: state.isSelected ? '#16a34a' : '#f0fdf4'
                              }
                            }),
                            menu: (base) => ({
                              ...base,
                              borderRadius: '12px',
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
                            placeholder: (base) => ({
                              ...base,
                              color: '#9ca3af',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            })
                          }}
                          formatOptionLabel={(option) => (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-medium text-sm">
                                {option.profilePicture ? (
                                  <img 
                                    src={option.profilePicture} 
                                    alt={option.label}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  option.label.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">{option.label}</div>
                                <div className="text-sm text-gray-500 truncate">{option.email}</div>
                              </div>
                            </div>
                          )}
                        />

                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowCreateTeamModal(false)}
                          className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <PlusCircle size={18} />
                            Create Team
                          </div>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default AdminDashboard;
