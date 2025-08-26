import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Navbar from "../components/AuthNavbar";
import Footer from "../components/Footer";
import { toast } from 'react-hot-toast';
import { 
  Users, 
  Briefcase, 
  ClipboardList, 
  Calendar, 
  ArrowLeft, 
  UserCheck, 
  CheckCircle, 
  AlertCircle,
  PlusCircle,
  Mail,
  ArrowRight
} from "lucide-react";
import { getAvatarUrl } from "../utils/avatarUtils";

const API = process.env.REACT_APP_API_BASE_URL || 'https://taskpilot-1-mzxb.onrender.com/api';

function TeamDetailPage() {
  const { token } = useAuth();
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      try {
        const [teamRes, projectsRes, tasksRes] = await Promise.all([
          axios.get(`${API}/teams/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTeam(teamRes.data);
        
        // Get all team member IDs (including manager)
        const allTeamMemberIds = [
          teamRes.data.manager?._id,
          ...teamRes.data.members.map(member => member._id)
        ].filter(Boolean);
        
        // Filter projects for this team - show projects where the team's manager is the project manager
        const teamProjects = projectsRes.data.filter(project => {
          // Check if the team's manager is the project manager
          const isTeamManagerProject = project.projectManager && 
            (typeof project.projectManager === 'string' ? project.projectManager : project.projectManager._id) === teamRes.data.manager?._id;
          
          // Check if any team member is assigned to the project
          const hasTeamMember = project.teamMembers && 
            project.teamMembers.some(member => 
              allTeamMemberIds.includes(typeof member === 'string' ? member : member._id)
            );
          
          return isTeamManagerProject || hasTeamMember;
        });
        setProjects(teamProjects);
        
        // Filter tasks for this team's projects
        const teamProjectIds = teamProjects.map(project => project._id);
        const teamTasks = tasksRes.data.filter(task => 
          teamProjectIds.includes(task.project)
        );
        setTasks(teamTasks);
      } catch (err) {
        toast.error("Failed to fetch team data");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [id, token]);



  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
          {/* Loading State */}
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              {/* Spinning Circle */}
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              {/* Team Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Users size={24} className="text-green-600" />
              </div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Team Details</h3>
              <p className="text-gray-600">Fetching team information...</p>
            </div>
            {/* Loading Dots */}
            <div className="flex space-x-2 mt-4">
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

  if (!team) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg border border-green-100 p-12 text-center">
            <Users size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Team Not Found</h3>
            <p className="text-gray-600 mb-4">The team you're looking for doesn't exist or you don't have access to it.</p>
            <Link to="/dashboard" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
              <ArrowRight size={18} />
              Back to Dashboard
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
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
        {/* Header with Back Button and Title - Responsive */}
        <div className="mb-4">
          {/* Back Button - Top Row on Mobile */}
          <div className="mb-3 md:hidden">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 hover:shadow-lg transition-all duration-200 font-medium text-sm"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
          </div>
          
          {/* Desktop Layout - Back Button and Title on Same Line */}
          <div className="hidden md:flex items-center justify-between">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 hover:shadow-lg transition-all duration-200 font-medium text-sm"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
            
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                Team Details
              </h1>
            </div>
            
            <div className="w-20"></div> {/* Spacer to center the title */}
          </div>
          
          {/* Mobile Layout - Centered Title */}
          <div className="md:hidden text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                Team Details
              </h1>
            </div>
          </div>
        </div>

                 {/* Team Info Card */}
         <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4 mb-6">
           <div className="flex items-center gap-3 mb-4">
             <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg">
               <Users size={24} className="text-white" />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-gray-800">{team.name}</h2>
               <p className="text-gray-600 text-sm">{team.description}</p>
             </div>
           </div>
            
                         {/* Team Stats */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
               <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                 <div className="flex items-center gap-2">
                   <div className="bg-green-500 p-1.5 rounded-md">
                     <Users size={16} className="text-white" />
                   </div>
                   <div>
                     <div className="text-xl font-bold text-gray-800">{team.members?.filter(member => member._id !== team.manager?._id).length || 0}</div>
                     <div className="text-xs text-gray-600">Team Members</div>
                   </div>
                 </div>
               </div>
               
               <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                 <div className="flex items-center gap-2">
                   <div className="bg-blue-500 p-1.5 rounded-md">
                     <Briefcase size={16} className="text-white" />
                   </div>
                   <div>
                     <div className="text-xl font-bold text-gray-800">{projects.length}</div>
                     <div className="text-xs text-gray-600">Projects</div>
                   </div>
                 </div>
               </div>
               
               <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                 <div className="flex items-center gap-2">
                   <div className="bg-purple-500 p-1.5 rounded-md">
                     <ClipboardList size={16} className="text-white" />
                   </div>
                   <div>
                     <div className="text-xl font-bold text-gray-800">{tasks.length}</div>
                     <div className="text-xs text-gray-600">Tasks</div>
                   </div>
                 </div>
               </div>
               
               <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
                 <div className="flex items-center gap-2">
                   <div className="bg-orange-500 p-1.5 rounded-md">
                     <CheckCircle size={16} className="text-white" />
                   </div>
                   <div>
                     <div className="text-xl font-bold text-gray-800">
                       {tasks.filter(task => task.status === 'completed').length}
                     </div>
                     <div className="text-xs text-gray-600">Completed</div>
                   </div>
                 </div>
               </div>
             </div>
          </div>

                 <div className="grid gap-6 lg:grid-cols-2">
           {/* Team Members Section */}
           <section>
             <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                   <div className="bg-green-100 p-1.5 rounded-md">
                     <Users size={16} className="text-green-600" />
                   </div>
                   <h2 className="text-lg font-bold text-gray-800">Team Members</h2>
                 </div>
                 <span className="text-xs text-gray-500">{team.members?.filter(member => member._id !== team.manager?._id).length || 0} members</span>
               </div>
              
                             {team.members?.filter(member => member._id !== team.manager?._id).length === 0 ? (
                 <div className="text-center py-6 min-h-[180px] flex flex-col justify-center items-center">
                   <Users size={32} className="text-gray-300 mx-auto mb-2" />
                   <p className="text-gray-600 text-sm">No team members yet</p>
                 </div>
               ) : (
                 <div className="space-y-3">
                   {team.members
                     ?.filter(member => member._id !== team.manager?._id)
                     .map((member) => (
                     <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                       <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full overflow-hidden">
                           {member.profilePicture ? (
                             <img 
                               src={member.profilePicture} 
                               alt={member.name}
                               className="w-full h-full object-cover"
                             />
                           ) : (
                             <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                               <span className="text-white text-xs font-bold">
                                 {member.name ? member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                               </span>
                             </div>
                           )}
                         </div>
                         <div>
                           <div className="font-semibold text-gray-800 text-sm">{member.name}</div>
                           <div className="text-xs text-gray-600">{member.role}</div>
                         </div>
                       </div>
                       <div className="text-right">
                         <div className="text-xs text-gray-600">{member.email}</div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </section>

                     {/* Team Manager Section */}
           <section>
             <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4">
               <div className="flex items-center gap-2 mb-4">
                 <div className="bg-blue-100 p-1.5 rounded-md">
                   <UserCheck size={16} className="text-blue-600" />
                 </div>
                 <h2 className="text-lg font-bold text-gray-800">Team Manager</h2>
               </div>
               
                                {team.manager ? (
                   <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                     <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full overflow-hidden">
                           {team.manager.profilePicture ? (
                             <img 
                               src={team.manager.profilePicture} 
                               alt={team.manager.name}
                               className="w-full h-full object-cover"
                             />
                           ) : (
                             <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                               <span className="text-white text-sm font-bold">
                                 {team.manager.name ? team.manager.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                               </span>
                             </div>
                           )}
                         </div>
                       <div className="flex-1">
                         <h3 className="text-base font-semibold text-gray-800">{team.manager.name}</h3>
                         <p className="text-gray-600 text-sm">{team.manager.email}</p>
                       </div>
                     </div>
                   </div>
                 ) : (
                 <div className="text-center py-6">
                   <UserCheck size={32} className="text-gray-300 mx-auto mb-2" />
                   <p className="text-gray-600 text-sm">No manager assigned</p>
                 </div>
               )}
             </div>
           </section>
        </div>

                 {/* Projects Section */}
         <section className="mt-6">
           <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <div className="bg-blue-100 p-1.5 rounded-md">
                   <Briefcase size={16} className="text-blue-600" />
                 </div>
                 <h2 className="text-lg font-bold text-gray-800">Team Projects</h2>
               </div>
               <span className="text-xs text-gray-500">{projects.length} projects</span>
             </div>
            
                         {projects.length === 0 ? (
               <div className="text-center py-6 min-h-[180px] flex flex-col justify-center items-center">
                 <Briefcase size={32} className="text-gray-300 mx-auto mb-2" />
                 <p className="text-gray-600 text-sm mb-3">No projects assigned to this team</p>
                 <Link
                   to="/projects/create"
                   className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-sm"
                 >
                   <PlusCircle size={14} />
                   Create Project
                 </Link>
               </div>
             ) : (
               <div className="grid gap-3 md:grid-cols-2">
                 {projects.map((project) => (
                   <div key={project._id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                     <div className="flex items-center justify-between mb-2">
                       <h3 className="font-semibold text-gray-800 text-sm">{project.name}</h3>
                     </div>
                     <p className="text-gray-600 text-xs mb-2">{project.description}</p>
                     <div className="flex items-center justify-between text-xs text-gray-500">
                       <span className="flex items-center gap-1">
                         <Calendar size={10} />
                         {new Date(project.startDate).toLocaleDateString()}
                       </span>
                       <Link
                         to={`/projects/${project._id}`}
                         className="text-green-600 hover:text-green-700 font-medium"
                       >
                         View Details →
                       </Link>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </section>

                 {/* Tasks Section */}
         <section className="mt-6">
           <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <div className="bg-purple-100 p-1.5 rounded-md">
                   <ClipboardList size={16} className="text-purple-600" />
                 </div>
                 <h2 className="text-lg font-bold text-gray-800">Team Tasks</h2>
               </div>
               <span className="text-xs text-gray-500">{tasks.length} tasks</span>
             </div>
            
                         {tasks.length === 0 ? (
               <div className="text-center py-6 min-h-[180px] flex flex-col justify-center items-center">
                 <ClipboardList size={32} className="text-gray-300 mx-auto mb-2" />
                 <p className="text-gray-600 text-sm mb-3">No tasks assigned to team members</p>
                 <Link
                   to="/add-task"
                   className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-sm"
                 >
                   <PlusCircle size={14} />
                   Create Task
                 </Link>
               </div>
             ) : (
               <div className="grid gap-3 md:grid-cols-2">
                 {tasks.map((task) => (
                   <div key={task._id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                     <div className="flex items-center justify-between mb-2">
                       <h3 className="font-semibold text-gray-800 text-sm">{task.title}</h3>
                       <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                         {task.status}
                       </span>
                     </div>
                     <p className="text-gray-600 text-xs mb-2">{task.description}</p>
                     <div className="flex items-center justify-between text-xs text-gray-500">
                       <span className="flex items-center gap-1">
                         <Calendar size={10} />
                         {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                       </span>
                       <Link
                         to={`/tasks/${task._id}`}
                         className="text-green-600 hover:text-green-700 font-medium"
                       >
                         View Details →
                       </Link>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default TeamDetailPage;
