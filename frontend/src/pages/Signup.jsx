import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Lock, 
  Venus, 
  Briefcase, 
  UserPlus, 
  Sparkles,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Users,
  ChevronDown,
  Search,
  Mars,
  UserCircle
} from "lucide-react";

const API = process.env.REACT_APP_API_BASE_URL || 'https://taskpilot-1-mzxb.onrender.com/api';

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    position: "",
    teamId: "",
    role: "Team Member", // hardcoded default role
  });

  const [teams, setTeams] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [teamSearchTerm, setTeamSearchTerm] = useState("");
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isTeamDropdownOpen && !event.target.closest('.team-dropdown')) {
        setIsTeamDropdownOpen(false);
      }
      if (isGenderDropdownOpen && !event.target.closest('.gender-dropdown')) {
        setIsGenderDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTeamDropdownOpen, isGenderDropdownOpen]);

  // Fetch teams for signup
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get(`${API}/teams/signup-teams`);
        setTeams(response.data);
      } catch (error) {
        // Don't show error toast as teams are optional
      }
    };

    fetchTeams();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "password") setTouched(true);
  };

  const isValidPassword = () => {
    const { password } = form;
    return (
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password) &&
      password.length >= 8
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidPassword()) {
      toast.error("Password does not meet security requirements.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API}/auth/register`, form);
      const teamMessage = form.teamId ? " and assigned to team!" : "!";
      toast.success(`Signup successful${teamMessage}`);
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordChecks = [
    { label: "At least 8 characters", test: (p) => p.length >= 8 },
    { label: "One lowercase letter (a-z)", test: (p) => /[a-z]/.test(p) },
    { label: "One uppercase letter (A-Z)", test: (p) => /[A-Z]/.test(p) },
    { label: "One number (0-9)", test: (p) => /\d/.test(p) },
    { label: "One special character (!@#$%^&*)", test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];

  const handleTeamSelect = (teamId, teamName) => {
    setForm({ ...form, teamId });
    setTeamSearchTerm(teamName);
    setIsTeamDropdownOpen(false);
  };

  const handleGenderSelect = (gender) => {
    setForm({ ...form, gender });
    setIsGenderDropdownOpen(false);
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(teamSearchTerm.toLowerCase())
  );

  const selectedTeam = teams.find(team => team._id === form.teamId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-3 shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h1>
          <p className="text-sm text-gray-600">Join TaskPilot and start managing your projects</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>

              {/* Password Validation */}
              {touched && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</h4>
                  <div className="space-y-1">
                    {passwordChecks.map((check, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {check.test(form.password) ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500" />
                        )}
                        <span className={`text-xs ${check.test(form.password) ? 'text-green-600' : 'text-red-600'}`}>
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Gender Field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Venus className="h-4 w-4 text-gray-400" />
                </div>
                
                {/* Custom Gender Dropdown Button */}
                <button
                  type="button"
                  onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsGenderDropdownOpen(!isGenderDropdownOpen);
                    }
                  }}
                  className="gender-dropdown relative w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm text-left hover:bg-gray-100 focus:shadow-sm"
                >
                  <span className={form.gender ? "text-gray-900" : "text-gray-500"}>
                    {form.gender || "Select Gender"}
                  </span>
                  <ChevronDown 
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      isGenderDropdownOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Custom Gender Dropdown Menu */}
                {isGenderDropdownOpen && (
                  <div className="gender-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="py-1">
                      {[
                        { value: "Male", label: "Male", icon: <Mars className="w-4 h-4" /> },
                        { value: "Female", label: "Female", icon: <Venus className="w-4 h-4" /> },
                        { value: "Other", label: "Other", icon: <UserCircle className="w-4 h-4" /> }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleGenderSelect(option.value)}
                          className={`w-full px-4 py-3 text-left hover:bg-green-50 active:bg-green-100 transition-all duration-150 flex items-center space-x-3 transform hover:scale-[1.01] ${
                            form.gender === option.value ? 'bg-green-100 text-green-800 shadow-sm' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white">
                            {option.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{option.label}</div>
                          </div>
                          {form.gender === option.value && (
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

                        {/* Team Selection Field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Select Team <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Users className="h-4 w-4 text-gray-400" />
                </div>
                
                {/* Custom Dropdown Button */}
                <button
                  type="button"
                  onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsTeamDropdownOpen(!isTeamDropdownOpen);
                    }
                  }}
                  className="team-dropdown relative w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm text-left hover:bg-gray-100 focus:shadow-sm"
                >
                  <span className={selectedTeam ? "text-gray-900" : "text-gray-500"}>
                    {selectedTeam ? selectedTeam.name : "Choose a team"}
                  </span>
                  <ChevronDown 
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      isTeamDropdownOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Custom Dropdown Menu */}
                {isTeamDropdownOpen && (
                  <div className="team-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search teams..."
                          value={teamSearchTerm}
                          onChange={(e) => setTeamSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Teams List */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredTeams.length > 0 ? (
                        filteredTeams.map((team) => (
                          <button
                            key={team._id}
                            type="button"
                            onClick={() => handleTeamSelect(team._id, team.name)}
                            className={`w-full px-4 py-3 text-left hover:bg-green-50 active:bg-green-100 transition-all duration-150 flex items-center space-x-3 transform hover:scale-[1.01] ${
                              form.teamId === team._id ? 'bg-green-100 text-green-800 shadow-sm' : 'text-gray-700'
                            }`}
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{team.name}</div>
                              {team.description && (
                                <div className="text-xs text-gray-500 truncate">{team.description}</div>
                              )}
                            </div>
                            {form.teamId === team._id && (
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-gray-500">
                          <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                            <Search className="w-4 h-4 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium">No teams found</p>
                          {teamSearchTerm && (
                            <p className="text-xs mt-1 text-gray-400">Try adjusting your search terms</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* No Teams Available Message */}
                    {teams.length === 0 && (
                      <div className="px-4 py-6 text-center text-gray-500 border-t border-gray-100">
                        <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium">No teams available</p>
                        <p className="text-xs mt-1 text-gray-400">You can join a team later from your dashboard</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Helper Text */}
              {teams.length === 0 && !isTeamDropdownOpen && (
                <p className="text-xs text-gray-500 mt-1">
                  No teams available. You can join a team later from your dashboard.
                </p>
              )}
            </div>

            {/* Position Field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Position <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="position"
                  placeholder="e.g. Frontend Developer, Project Manager"
                  value={form.position}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isValidPassword()}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 px-4 rounded-lg font-medium hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium group text-sm"
          >
            <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Sign in to your account</span>
          </Link>
        </div>

        {/* Features List */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>No Credit Card</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Instant Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
