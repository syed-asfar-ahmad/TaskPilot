import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import AuthNavbar from "../components/AuthNavbar";
import Footer from "../components/Footer";
import { toast } from 'react-hot-toast'; 

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

const API = process.env.REACT_APP_API_BASE_URL;

function ManagerDashboard() {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentProjectsPage, setCurrentProjectsPage] = useState(1);
  const [currentTasksPage, setCurrentTasksPage] = useState(1);
  const [projectsPerPage] = useState(4);
  const [tasksPerPage] = useState(4);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projRes, taskRes, memberRes] = await Promise.all([
          axios.get(`${API}/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/tasks/manager-tasks`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/users/my-team-members`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        
        // Sort projects by creation date (newest first)
        const sortedProjects = projRes.data.sort((a, b) => {
          const dateA = new Date(a.createdAt || a._id);
          const dateB = new Date(b.createdAt || b._id);
          return dateB - dateA;
        });
        setProjects(sortedProjects);
        
        // Sort tasks by creation date (newest first)
        const sortedTasks = taskRes.data.sort((a, b) => {
          const dateA = new Date(a.createdAt || a._id);
          const dateB = new Date(b.createdAt || b._id);
          return dateB - dateA;
        });
        setTasks(sortedTasks);
        
        // Use the team members directly from the API response
        setMembers(memberRes.data);
      } catch (err) {
        toast.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user._id]);

  // Pagination logic for projects
  const indexOfLastProject = currentProjectsPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
  const totalProjectsPages = Math.ceil(projects.length / projectsPerPage);

  // Pagination logic for tasks
  const indexOfLastTask = currentTasksPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalTasksPages = Math.ceil(tasks.length / tasksPerPage);

  const handleProjectsPageChange = (pageNumber) => {
    setCurrentProjectsPage(pageNumber);
  };

  const handleTasksPageChange = (pageNumber) => {
    setCurrentTasksPage(pageNumber);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'on hold':
        return 'bg-red-100 text-red-800';
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

  const getTaskCount = (memberId) => {
    // Get all tasks from projects assigned to this manager
    return tasks.filter(task => {
      // Check if task is assigned to this member
      const isAssignedToMember = task.assignedTo && 
        (Array.isArray(task.assignedTo) ? 
          task.assignedTo.some(assignee => 
            typeof assignee === "string" ? assignee === memberId : assignee._id === memberId
          ) : 
          (typeof task.assignedTo === "string" ? task.assignedTo === memberId : task.assignedTo._id === memberId)
        );
      
      return isAssignedToMember;
    }).length;
  };

  // Chart data
  const taskStatusData = {
    labels: ['Completed', 'In Progress', 'To Do'],
    datasets: [
      {
        data: [
          tasks.filter(task => task.status === 'Completed').length,
          tasks.filter(task => task.status === 'In Progress').length,
          tasks.filter(task => task.status === 'To Do').length,
        ],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'],
        borderWidth: 0,
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
        <AuthNavbar />
        <main className="flex-1 max-w-7xl mx-auto px-3 py-4">
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
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
      <AuthNavbar />
      <main className="flex-1 max-w-7xl mx-auto px-3 py-4">
        {/* Header with Title - Styled like other pages */}
        <div className="mb-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center">
                <BarChart size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                Manager Dashboard
              </h1>
            </div>
          </div>
          
          <div className="text-center mb-3">
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Welcome back, {user?.name}! Manage assigned projects and tasks.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Projects Card */}
          <div className="group relative bg-gradient-to-br from-white to-green-50 p-4 rounded-xl shadow-lg border border-green-200 hover:shadow-xl hover:scale-102 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 opacity-10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg flex items-center justify-center transition-transform duration-300">
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
                <p className="text-xs text-gray-600">Assigned projects</p>
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg flex items-center justify-center transition-transform duration-300">
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

          {/* Team Members Card */}
          <div className="group relative bg-gradient-to-br from-white to-purple-50 p-4 rounded-xl shadow-lg border border-purple-200 hover:shadow-xl hover:scale-102 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 opacity-10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center transition-transform duration-300">
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
                <p className="text-xs text-gray-600">Assigned team size</p>
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
              <h2 className="text-xl font-bold text-gray-800">All Projects</h2>
            </div>
            <Link
              to="/projects/create"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-sm"
            >
              <FilePlus size={18} />
              Add Project
            </Link>
          </div>
          
          {projects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-green-100 p-8 text-center min-h-[180px] flex flex-col justify-center items-center">
              <Briefcase size={48} className="text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Projects Found</h3>
              <p className="text-gray-600 mb-3 text-sm">You haven't been assigned to any projects yet.</p>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                <Briefcase size={16} />
                View All Projects
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                {currentProjects.map((project) => (
                  <div
                    key={project._id}
                    className="bg-white rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <Link
                            to={`/projects/${project._id}`}
                            className="group-hover:text-green-800 transition-colors"
                          >
                            <h3 className="text-lg font-bold text-green-700 group-hover:text-green-800 transition-colors cursor-pointer">
                              {project.name}
                            </h3>
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
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

                             {/* Projects Pagination */}
               {projects.length > 0 && (
                 <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4 mt-4">
                   <div className="flex items-center justify-between">
                     <div className="text-xs text-gray-600">
                       Showing {indexOfFirstProject + 1} to {Math.min(indexOfLastProject, projects.length)} of {projects.length} projects
                     </div>
                     <div className="flex items-center gap-1">
                       <button
                         onClick={() => handleProjectsPageChange(currentProjectsPage - 1)}
                         disabled={currentProjectsPage === 1}
                         className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                           currentProjectsPage === 1
                             ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                             : 'bg-green-100 text-green-700 hover:bg-green-200'
                         }`}
                       >
                         Previous
                       </button>
                       
                       <div className="flex items-center gap-1">
                         {Array.from({ length: totalProjectsPages }, (_, index) => index + 1).map((pageNumber) => (
                           <button
                             key={pageNumber}
                             onClick={() => handleProjectsPageChange(pageNumber)}
                             className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                               currentProjectsPage === pageNumber
                                 ? 'bg-green-600 text-white'
                                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                             }`}
                           >
                             {pageNumber}
                           </button>
                         ))}
                       </div>
                       
                       <button
                         onClick={() => handleProjectsPageChange(currentProjectsPage + 1)}
                         disabled={currentProjectsPage === totalProjectsPages}
                         className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                           currentProjectsPage === totalProjectsPages
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
        </section>

        {/* Tasks Section */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-full shadow-lg border border-green-100">
                <CheckSquare size={20} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">All Tasks</h2>
            </div>
            <Link
              to="/add-task"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-sm"
            >
              <PlusCircle size={18} />
              Add Task
            </Link>
          </div>
          
          {tasks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-green-100 p-8 text-center min-h-[180px] flex flex-col justify-center items-center">
              <CheckSquare size={48} className="text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Tasks Found</h3>
              <p className="text-gray-600 mb-3 text-sm">Get started by creating your first task</p>
              <Link
                to="/add-task"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                <PlusCircle size={16} />
                Create Task
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                {currentTasks.map((task) => (
                  <div
                    key={task._id}
                    className="bg-white rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <Link
                            to={`/tasks/${task._id}`}
                            className="group-hover:text-green-800 transition-colors"
                          >
                            <h3 className="text-lg font-bold text-green-700 group-hover:text-green-800 transition-colors cursor-pointer">
                              {task.title}
                            </h3>
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

                             {/* Tasks Pagination */}
               {tasks.length > 0 && (
                 <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4 mt-4">
                   <div className="flex items-center justify-between">
                     <div className="text-xs text-gray-600">
                       Showing {indexOfFirstTask + 1} to {Math.min(indexOfLastTask, tasks.length)} of {tasks.length} tasks
                     </div>
                     <div className="flex items-center gap-1">
                       <button
                         onClick={() => handleTasksPageChange(currentTasksPage - 1)}
                         disabled={currentTasksPage === 1}
                         className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                           currentTasksPage === 1
                             ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                             : 'bg-green-100 text-green-700 hover:bg-green-200'
                         }`}
                       >
                         Previous
                       </button>
                       
                       <div className="flex items-center gap-1">
                         {Array.from({ length: totalTasksPages }, (_, index) => index + 1).map((pageNumber) => (
                           <button
                             key={pageNumber}
                             onClick={() => handleTasksPageChange(pageNumber)}
                             className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                               currentTasksPage === pageNumber
                                 ? 'bg-green-600 text-white'
                                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                             }`}
                           >
                             {pageNumber}
                           </button>
                         ))}
                       </div>
                       
                       <button
                         onClick={() => handleTasksPageChange(currentTasksPage + 1)}
                         disabled={currentTasksPage === totalTasksPages}
                         className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                           currentTasksPage === totalTasksPages
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
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ManagerDashboard; 