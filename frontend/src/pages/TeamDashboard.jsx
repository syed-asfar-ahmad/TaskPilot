import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import AuthNavbar from "../components/AuthNavbar";
import Footer from "../components/Footer";
import {
  ClipboardList,
  Briefcase,
  CalendarDays,
  NotebookPen,
  FileText,
  CheckSquare,
  Calendar,
  ArrowRight,
  Users,
} from "lucide-react";

const API = process.env.REACT_APP_API_BASE_URL;

function TeamDashboard() {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTasksPage, setCurrentTasksPage] = useState(1);
  const [currentProjectsPage, setCurrentProjectsPage] = useState(1);
  const [tasksPerPage] = useState(4);
  const [projectsPerPage] = useState(4);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const taskRes = await axios.get(`${API}/tasks/my-tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const projectRes = await axios.get(`${API}/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTasks(taskRes.data);

        const userProjects = projectRes.data.filter(p =>
          p.teamMembers?.some(member => {
            if (typeof member === "string") {
              return member === user._id;
            } else if (typeof member === "object") {
              return member._id === user._id;
            }
            return false;
          })
        );
        setProjects(userProjects);

      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user._id]);

  // Pagination logic for tasks
  const indexOfLastTask = currentTasksPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalTasksPages = Math.ceil(tasks.length / tasksPerPage);

  // Pagination logic for projects
  const indexOfLastProject = currentProjectsPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
  const totalProjectsPages = Math.ceil(projects.length / projectsPerPage);

  const handleTasksPageChange = (pageNumber) => {
    setCurrentTasksPage(pageNumber);
  };

  const handleProjectsPageChange = (pageNumber) => {
    setCurrentProjectsPage(pageNumber);
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

  const getProjectStatusColor = (status) => {
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
      <AuthNavbar />

      <main className="max-w-7xl mx-auto px-3 py-4 flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 min-h-[60vh]">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <NotebookPen size={20} className="text-green-600" />
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
                    <NotebookPen size={20} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                    Team Member Dashboard
                  </h1>
                </div>
              </div>
              
              <div className="text-center mb-3">
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                  Track your assigned tasks and projects
                </p>
              </div>
            </div>

            {/* Tasks Section */}
            <section className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-white p-1.5 rounded-full shadow-lg border border-green-100">
                    <CheckSquare size={20} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Your Assigned Tasks</h2>
                </div>
              </div>
              
              {tasks.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg border border-green-100 p-8 text-center min-h-[180px] flex flex-col justify-center items-center">
                  <CheckSquare size={48} className="text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Tasks Assigned</h3>
                  <p className="text-gray-600 mb-3 text-sm">You don't have any tasks assigned to you yet</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 md:grid-cols-2">
                    {currentTasks.map(task => (
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
                                <h3 className="text-lg font-bold text-green-700 group-hover:text-green-800 transition-colors cursor-pointer flex items-center gap-2">
                                  <FileText size={14} />
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

            {/* Projects Section */}
            <section className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-white p-1.5 rounded-full shadow-lg border border-green-100">
                    <Briefcase size={20} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Your Projects & Team</h2>
                </div>
              </div>
              
              {projects.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg border border-green-100 p-8 text-center min-h-[180px] flex flex-col justify-center items-center">
                  <Briefcase size={48} className="text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Projects Assigned</h3>
                  <p className="text-gray-600 mb-3 text-sm">You are not assigned to any projects yet</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 md:grid-cols-2">
                    {currentProjects.map(project => {
                      const teammates = new Set();

                      tasks.forEach(task => {
                        if (task.project?._id === project._id) {
                          task.assignedTo?.forEach(member => {
                            if (typeof member === "object" && member._id !== user._id) {
                              teammates.add(member.name);
                            }
                          });
                        }
                      });

                      return (
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
                                  <h3 className="text-lg font-bold text-green-700 group-hover:text-green-800 transition-colors cursor-pointer flex items-center gap-2">
                                    <Briefcase size={14} />
                                    {project.name}
                                  </h3>
                                </Link>
                                <p className="text-gray-600 text-xs mt-1 line-clamp-2">{project.description}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProjectStatusColor(project.status)} ml-3`}>
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
                                {teammates.size > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Users size={14} className="text-green-500" />
                                    <span className="font-medium">Teammates:</span>
                                    <span>{[...teammates].join(", ")}</span>
                                  </div>
                                )}
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
                      );
                    })}
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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default TeamDashboard;
