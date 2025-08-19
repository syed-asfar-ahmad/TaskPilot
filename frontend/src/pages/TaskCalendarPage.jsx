import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { toast } from 'react-hot-toast';

import Navbar from "../components/AuthNavbar";
import Footer from "../components/Footer";
import BackButton from "../components/backButton";
import { useAuth } from "../context/AuthContext";

import "../styles/calendar.css";

const API = process.env.REACT_APP_API_BASE_URL;

function TaskCalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token, user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Determine which endpoints to use based on user role
        let taskUrl, projectUrl;
        
        if (user?.role === 'Team Member') {
          taskUrl = `${API}/tasks/my-tasks`;
          projectUrl = `${API}/projects`;
        } else if (user?.role === 'Manager') {
          taskUrl = `${API}/tasks/manager-tasks`;
          projectUrl = `${API}/projects`;
        } else {
          taskUrl = `${API}/tasks/calendar/tasks`;
          projectUrl = `${API}/projects`;
        }

        const [taskRes, projectRes] = await Promise.all([
          axios.get(taskUrl, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(projectUrl, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Filter projects for Team Members and Managers
        let filteredProjects = projectRes.data;
        if (user?.role === 'Team Member') {
          filteredProjects = projectRes.data.filter(project => 
            project.teamMembers?.some(member => 
              typeof member === "string" ? member === user._id : member._id === user._id
            )
          );
        } else if (user?.role === 'Manager') {
          filteredProjects = projectRes.data.filter(project => 
            project.teamMembers?.some(member => 
              typeof member === "string" ? member === user._id : member._id === user._id
            ) || 
            (project.projectManager && 
             (typeof project.projectManager === "string" ? 
              project.projectManager === user._id : 
              project.projectManager._id === user._id))
          );
        }

        const taskEvents = taskRes.data.map((task) => ({
          id: task._id,
          title: task.title,
          start: task.dueDate,
          allDay: true,
          backgroundColor: "#16a34a", // Green
          borderColor: "#16a34a",
          type: "task",
          extendedProps: {
            fullTitle: `Task: ${task.title}`,
          },
        }));

        const projectEvents = filteredProjects.map((project) => ({
          id: project._id,
          title: project.name,
          start: project.deadline,
          allDay: true,
          backgroundColor: "#7c3aed", // Purple
          borderColor: "#7c3aed",
          type: "project",
          extendedProps: {
            fullTitle: `Project: ${project.name}`,
          },
        }));

        setEvents([...taskEvents, ...projectEvents]);
      } catch (error) {
        toast.error('Failed to load calendar events');
      } finally {
        setLoading(false);
      }
    };

    if (token && user) {
      fetchEvents();
    }
  }, [token, user]);

  const handleEventClick = (info) => {
    const { id, extendedProps } = info.event;
    if (extendedProps.type === "task") {
      navigate(`/tasks/${id}`);
    } else if (extendedProps.type === "project") {
      navigate(`/projects/${id}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
      <Navbar />
      <main className="flex-grow px-3 py-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            /* Loading State - More Compact */
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CalendarDays size={20} className="text-green-600" />
                </div>
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Loading Calendar</h3>
                <p className="text-gray-600 text-sm">Fetching your tasks and projects...</p>
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
                      <CalendarDays size={20} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                      {user?.role === "Team Member" ? "My Tasks & Projects Calendar" : 
                       user?.role === "Manager" ? "Assigned Tasks & Projects Calendar" : 
                       "Task & Project Calendar"}
                    </h1>
                  </div>
                  
                  <div className="w-20"></div> {/* Spacer to center the title */}
                </div>
                
                {/* Mobile Layout - Centered Title */}
                <div className="md:hidden text-center">
                  <div className="inline-flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center">
                      <CalendarDays size={20} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                      {user?.role === "Team Member" ? "My Tasks & Projects Calendar" : 
                       user?.role === "Manager" ? "Assigned Tasks & Projects Calendar" : 
                       "Task & Project Calendar"}
                    </h1>
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-3">
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                  Stay organized with your project timeline
                </p>
              </div>

              {/* Calendar Container - More Compact */}
              <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-green-100 min-h-[400px]">
                <div className="p-1">
                  <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    height="auto"
                    eventClick={handleEventClick}
                    eventDidMount={(info) => {
                      info.el.setAttribute("title", info.event.extendedProps.fullTitle);
                      // Add custom classes for different event types
                      if (info.event.extendedProps.type === "task") {
                        info.el.classList.add("fc-event-task");
                      } else if (info.event.extendedProps.type === "project") {
                        info.el.classList.add("fc-event-project");
                      }
                    }}
                    headerToolbar={{
                      left: "prev",
                      center: "title",
                      right: "next",
                    }}
                    dayMaxEvents={3}
                    moreLinkClick="popover"
                    eventDisplay="block"
                    lazyFetching={true}
                    rerenderDelay={10}
                    eventMinHeight={16}
                    aspectRatio={1.35}
                  />
                </div>
              </div>

              {/* Enhanced Legend - More Compact */}
              <div className="mt-4 flex justify-center">
                <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-green-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
                    Calendar Legend
                  </h3>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-r from-green-500 to-green-600 shadow-md"></div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800">Tasks</span>
                        <p className="text-xs text-gray-500">Individual tasks</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-r from-purple-600 to-purple-700 shadow-md"></div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800">Projects</span>
                        <p className="text-xs text-gray-500">Project deadlines</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TaskCalendarPage;
