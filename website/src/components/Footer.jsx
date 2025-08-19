import { Link } from "react-router-dom";
import { Twitter, Linkedin, Instagram, Facebook, Mail, Phone, MapPin, ArrowRight, CheckCircle, Users, Calendar, BarChart3 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content - Compact */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-8">
            
            {/* Brand Section - Compact */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
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

            {/* Quick Links - Compact */}
            <div>
              <h4 className="text-white font-bold text-base mb-4 flex items-center">
                <span className="w-6 h-0.5 bg-green-500 mr-2"></span>
                Quick Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="flex items-center text-gray-400 hover:text-green-400 transition-colors duration-200 group">
                    <ArrowRight size={12} className="mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                    <span className="text-sm">Home</span>
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="flex items-center text-gray-400 hover:text-green-400 transition-colors duration-200 group">
                    <ArrowRight size={12} className="mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                    <span className="text-sm">Features</span>
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="flex items-center text-gray-400 hover:text-green-400 transition-colors duration-200 group">
                    <ArrowRight size={12} className="mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                    <span className="text-sm">About</span>
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="flex items-center text-gray-400 hover:text-green-400 transition-colors duration-200 group">
                    <ArrowRight size={12} className="mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                    <span className="text-sm">Contact</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support - Compact */}
            <div>
              <h4 className="text-white font-bold text-base mb-4 flex items-center">
                <span className="w-6 h-0.5 bg-green-500 mr-2"></span>
                Support
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail size={14} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Email</p>
                    <a href="mailto:support@taskpilot.com" className="text-white hover:text-green-400 transition-colors duration-200 text-sm">
                      support@taskpilot.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone size={14} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Phone</p>
                    <a href="tel:+923001234567" className="text-white hover:text-green-400 transition-colors duration-200 text-sm">
                      +92 (300) 123-4567
                    </a>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={14} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Location</p>
                    <p className="text-white text-sm">Lahore, Pakistan</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Features - Compact */}
            <div>
              <h4 className="text-white font-bold text-base mb-4 flex items-center">
                <span className="w-6 h-0.5 bg-green-500 mr-2"></span>
                Key Features
              </h4>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={12} className="text-green-400" />
                  </div>
                  <span className="text-gray-400 text-xs">Task Management</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users size={12} className="text-green-400" />
                  </div>
                  <span className="text-gray-400 text-xs">Team Collaboration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar size={12} className="text-green-400" />
                  </div>
                  <span className="text-gray-400 text-xs">Calendar Integration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <BarChart3 size={12} className="text-green-400" />
                  </div>
                  <span className="text-gray-400 text-xs">Progress Tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={12} className="text-green-400" />
                  </div>
                  <span className="text-gray-400 text-xs">Real-time Updates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users size={12} className="text-green-400" />
                  </div>
                  <span className="text-gray-400 text-xs">Role-based Access</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Compact */}
        <div className="border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-4">
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
