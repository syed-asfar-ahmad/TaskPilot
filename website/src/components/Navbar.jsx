import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const linkClass = (path) => {
    const isActive = location.pathname === path;
    return `
      relative px-2 py-1 text-sm font-medium rounded-lg transition-all duration-200 group
      ${isActive 
        ? 'text-green-600 bg-green-50 shadow-sm' 
        : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
      }
    `;
  };

  const buttonClass = (isPrimary = false) => {
    const baseClass = "px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2";
    return isPrimary 
      ? `${baseClass} bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg hover:from-green-700 hover:to-green-800 focus:ring-green-500`
      : `${baseClass} text-green-600 border-2 border-green-600 hover:bg-green-600 hover:text-white focus:ring-green-500`;
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
        : 'bg-white shadow-sm'
    }`}>
      <nav className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - Compact */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 transform group-hover:scale-105">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                TaskPilot
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">Project Management</p>
            </div>
          </Link>

          {/* Desktop Navigation - Compact */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={linkClass('/')}>
              <span className="relative">
                Home
                {location.pathname === '/' && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-green-600 rounded-full"></span>
                )}
              </span>
            </Link>
            <Link to="/features" className={linkClass('/features')}>
              <span className="relative">
                Features
                {location.pathname === '/features' && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-green-600 rounded-full"></span>
                )}
              </span>
            </Link>
            <Link to="/about" className={linkClass('/about')}>
              <span className="relative">
                About
                {location.pathname === '/about' && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-green-600 rounded-full"></span>
                )}
              </span>
            </Link>
            <Link to="/contact" className={linkClass('/contact')}>
              <span className="relative">
                Contact
                {location.pathname === '/contact' && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-green-600 rounded-full"></span>
                )}
              </span>
            </Link>
          </div>

          {/* Desktop Buttons - Compact */}
          <div className="hidden md:flex items-center space-x-2">
            <a 
              href="https://taskpilot-dashboard.vercel.app/login" 
              className={buttonClass(false)}
            >
              Login
            </a>
            <a 
              href="https://taskpilot-dashboard.vercel.app/signup" 
              className={buttonClass(true)}
            >
              Sign Up
            </a>
          </div>

          {/* Mobile Menu Button - Compact */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileOpen(!mobileOpen)} 
              className="p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
            >
              {mobileOpen ? (
                <X className="w-5 h-5 transform rotate-180 transition-transform duration-200" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Compact */}
        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          mobileOpen ? 'max-h-80 opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 space-y-1">
            <Link 
              to="/" 
              onClick={() => setMobileOpen(false)} 
              className={`block px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/' 
                  ? 'text-green-600 bg-green-50 border-l-4 border-green-600' 
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/features" 
              onClick={() => setMobileOpen(false)} 
              className={`block px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/features' 
                  ? 'text-green-600 bg-green-50 border-l-4 border-green-600' 
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              Features
            </Link>
            <Link 
              to="/about" 
              onClick={() => setMobileOpen(false)} 
              className={`block px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/about' 
                  ? 'text-green-600 bg-green-50 border-l-4 border-green-600' 
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setMobileOpen(false)} 
              className={`block px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/contact' 
                  ? 'text-green-600 bg-green-50 border-l-4 border-green-600' 
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              Contact
            </Link>
            
            <div className="pt-3 border-t border-gray-100 space-y-1">
              <a 
                href="https://taskpilot-dashboard.vercel.app/login" 
                className="block px-3 py-2 text-green-600 font-semibold border-2 border-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all duration-200 text-center"
              >
                Login
              </a>
              <a 
                href="https://taskpilot-dashboard.vercel.app/signup" 
                className="block px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 text-center shadow-lg"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
