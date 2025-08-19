import { Link } from "react-router-dom";
import { Twitter, Linkedin, Instagram, Facebook, Mail, Phone, MapPin, ArrowRight, CheckCircle, Users, Calendar, BarChart3, Bell, MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
                     <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-8">
            
                         {/* Brand Section */}
             <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">TaskPilot</h3>
                  <p className="text-green-400 text-xs font-medium">Project Management</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4 text-sm">
                Streamline your workflow with our comprehensive project management platform. 
                Manage teams, track progress, and deliver results efficiently.
              </p>
              <div className="flex space-x-3">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                   className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white hover:from-green-600 hover:to-green-700 transform hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <Instagram size={16} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                   className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white hover:from-green-600 hover:to-green-700 transform hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <Facebook size={16} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
                   className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white hover:from-green-600 hover:to-green-700 transform hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <Twitter size={16} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" 
                   className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white hover:from-green-600 hover:to-green-700 transform hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <Linkedin size={16} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold text-base mb-4 flex items-center">
                <span className="w-6 h-0.5 bg-green-500 mr-2"></span>
                Quick Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to={user?.role === "Team Member" ? "/team-dashboard" : user?.role === "Manager" ? "/manager-dashboard" : "/dashboard"} 
                    className="flex items-center text-gray-400 hover:text-green-400 transition-colors duration-200 group"
                  >
                    <ArrowRight size={14} className="mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/projects" className="flex items-center text-gray-400 hover:text-green-400 transition-colors duration-200 group">
                    <ArrowRight size={14} className="mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                    Projects
                  </Link>
                </li>
                <li>
                  <Link to="/tasks" className="flex items-center text-gray-400 hover:text-green-400 transition-colors duration-200 group">
                    <ArrowRight size={14} className="mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                    Tasks
                  </Link>
                </li>
                <li>
                  <Link to="/calendar" className="flex items-center text-gray-400 hover:text-green-400 transition-colors duration-200 group">
                    <ArrowRight size={14} className="mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                    Calendar
                  </Link>
                </li>
                <li>
                  <Link to="/chat" className="flex items-center text-gray-400 hover:text-green-400 transition-colors duration-200 group">
                    <ArrowRight size={14} className="mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                    Chat
                  </Link>
                </li>
                <li>
                  <Link to="/notifications" className="flex items-center text-gray-400 hover:text-green-400 transition-colors duration-200 group">
                    <ArrowRight size={14} className="mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                    Notifications
                  </Link>
                </li>
                {user?.role === "Admin" && (
                  <li>
                    <Link to="/members" className="flex items-center text-gray-400 hover:text-green-400 transition-colors duration-200 group">
                      <ArrowRight size={14} className="mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                      Team Members
                    </Link>
                  </li>
                )}
                <li>
                  <Link to="/profile" className="flex items-center text-gray-400 hover:text-green-400 transition-colors duration-200 group">
                    <ArrowRight size={14} className="mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                    Profile
                  </Link>
                </li>
              </ul>
            </div>

                         {/* Support */}
             <div>
               <h4 className="text-white font-bold text-base mb-4 flex items-center">
                 <span className="w-6 h-0.5 bg-green-500 mr-2"></span>
                 Support
               </h4>
               <ul className="space-y-3">
                 <li className="flex items-start space-x-3">
                   <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                     <Mail size={16} className="text-green-400" />
                   </div>
                   <div>
                     <p className="text-gray-400 text-sm">Email</p>
                     <a href="mailto:support@taskpilot.com" className="text-white hover:text-green-400 transition-colors duration-200">
                       support@taskpilot.com
                     </a>
                   </div>
                 </li>
                 <li className="flex items-start space-x-3">
                   <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                     <Phone size={16} className="text-green-400" />
                   </div>
                   <div>
                     <p className="text-gray-400 text-sm">Phone</p>
                     <a href="tel:+923001234567" className="text-white hover:text-green-400 transition-colors duration-200">
                       +92 (300) 123-4567
                     </a>
                   </div>
                 </li>
                 <li className="flex items-start space-x-3">
                   <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                     <MapPin size={16} className="text-green-400" />
                   </div>
                   <div>
                     <p className="text-gray-400 text-sm">Location</p>
                     <p className="text-white">Lahore, Pakistan</p>
                   </div>
                 </li>
               </ul>
             </div>

             {/* Features */}
             <div>
               <h4 className="text-white font-bold text-base mb-4 flex items-center">
                 <span className="w-6 h-0.5 bg-green-500 mr-2"></span>
                 Key Features
               </h4>
               <ul className="space-y-2">
                 <li className="flex items-center space-x-3 group relative">
                   <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                     <CheckCircle size={14} className="text-green-400" />
                   </div>
                   <span className="text-gray-400 text-sm">Task Management</span>
                   <span className="absolute left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-gray-100 text-xs rounded px-2 py-1 ml-2 transition-opacity whitespace-nowrap z-20">Create, assign, and track tasks easily</span>
                 </li>
                 <li className="flex items-center space-x-3 group relative">
                   <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                     <Users size={14} className="text-green-400" />
                   </div>
                   <span className="text-gray-400 text-sm">Team Collaboration</span>
                   <span className="absolute left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-gray-100 text-xs rounded px-2 py-1 ml-2 transition-opacity whitespace-nowrap z-20">Work together with your team in real time, including instant messaging</span>
                 </li>
                 <li className="flex items-center space-x-3 group relative">
                   <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                     <Calendar size={14} className="text-green-400" />
                   </div>
                   <span className="text-gray-400 text-sm">Calendar Integration</span>
                   <span className="absolute left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-gray-100 text-xs rounded px-2 py-1 ml-2 transition-opacity whitespace-nowrap z-20">Sync tasks and deadlines with your calendar</span>
                 </li>
                 <li className="flex items-center space-x-3 group relative">
                   <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                     <BarChart3 size={14} className="text-green-400" />
                   </div>
                   <span className="text-gray-400 text-sm">Progress Tracking</span>
                   <span className="absolute left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-gray-100 text-xs rounded px-2 py-1 ml-2 transition-opacity whitespace-nowrap z-20">Visualize and monitor project progress</span>
                 </li>
                 <li className="flex items-center space-x-3 group relative">
                   <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                     <Users size={14} className="text-green-400" />
                   </div>
                   <span className="text-gray-400 text-sm">Role-based Access</span>
                   <span className="absolute left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-gray-100 text-xs rounded px-2 py-1 ml-2 transition-opacity whitespace-nowrap z-20">Permissions for Admin, Manager, and Team Member</span>
                 </li>
                 <li className="flex items-center space-x-3 group relative">
                   <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                     <Bell size={14} className="text-green-400" />
                   </div>
                   <span className="text-gray-400 text-sm">Notifications</span>
                   <span className="absolute left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-gray-100 text-xs rounded px-2 py-1 ml-2 transition-opacity whitespace-nowrap z-20">Stay informed with alerts and reminders</span>
                 </li>
               </ul>
             </div>


          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-center items-center">
              <div className="text-gray-400 text-xs">
                © {new Date().getFullYear()} TaskPilot. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
