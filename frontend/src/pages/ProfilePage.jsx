import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  CalendarDays,
  User,
  PencilLine,
  Mail,
  Venus,
  ShieldCheck,
  UserCircle,
  Briefcase,
  MapPin,
  Quote,
  Camera,
  Save,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Navbar from "../components/AuthNavbar";
import Footer from "../components/Footer";
import { getAvatarUrl } from "../utils/avatarUtils";
import { useAuth } from "../context/AuthContext";

const roleIcons = {
  Admin: <ShieldCheck className="inline-block w-4 h-4 text-red-500 mr-1" />,
  Manager: <Briefcase className="inline-block w-4 h-4 text-amber-500 mr-1" />,
  "Team Member": <UserCircle className="inline-block w-4 h-4 text-green-500 mr-1" />,
};

const roleColors = {
  Admin: {
    bg: "bg-gradient-to-br from-red-50 to-red-100",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700"
  },
  Manager: {
    bg: "bg-gradient-to-br from-amber-50 to-amber-100",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700"
  },
  "Team Member": {
    bg: "bg-gradient-to-br from-green-50 to-green-100",
    border: "border-green-200",
    text: "text-green-700",
    badge: "bg-green-100 text-green-700"
  }
};

function ProfilePage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    gender: "",
    dateOfBirth: "",
    profilePicture: "",
  });

  const API = process.env.REACT_APP_API_BASE_URL || 'https://taskpilot-1-mzxb.onrender.com/api';
const IMG = (process.env.REACT_APP_API_BASE_URL || 'https://taskpilot-1-mzxb.onrender.com/api').replace("/api", "");

  const [file, setFile] = useState(null);
  const token = localStorage.getItem("token");
  
  // Date picker state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    let profilePictureUrl = profile.profilePicture;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`${API}/upload-profile-image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Upload failed: ${res.status}`);
        }

        const data = await res.json();

        if (data?.url) {
          profilePictureUrl = data.url;
        } else {
          toast.error("Image upload failed - no URL returned");
          return;
        }
      } catch (err) {
        toast.error("Image upload failed. Please try again.");
        return;
      }
    }

    try {
      await axios.put(
        `${API}/users/profile`,
        {
          bio: profile.bio,
          gender: profile.gender,
          dateOfBirth: profile.dateOfBirth,
          position: profile.position,
          profilePicture: profilePictureUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Profile updated successfully");
      fetchProfile(); // refresh updated info
      setFile(null);  // clear selected file
      
      // Refresh user data in AuthContext to update navbar
      await refreshUser();
      
      // Dispatch notification refresh event
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    } catch (err) {
      toast.error("Profile update failed");
    }
  };

  const handleProfilePictureChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Please select a valid image file (JPEG, JPG, or PNG)");
      return;
    }
    
    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    
    setFile(selectedFile);
    toast.success("Image selected successfully");
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty days for padding
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const handleDateSelect = (date, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedDate(date);
    setProfile({ ...profile, dateOfBirth: date.toISOString().split('T')[0] });
    setIsDatePickerOpen(false);
  };

  const nextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isFutureDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  // Year and month selection functions
  const handleYearSelect = (year, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setIsYearPickerOpen(false);
  };

  const handleMonthSelect = (month, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
    setIsMonthPickerOpen(false);
  };

  const getYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 100; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse();
  };

  const getMonths = () => {
    return [
      { value: 0, name: 'Jan' },
      { value: 1, name: 'Feb' },
      { value: 2, name: 'Mar' },
      { value: 3, name: 'Apr' },
      { value: 4, name: 'May' },
      { value: 5, name: 'Jun' },
      { value: 6, name: 'Jul' },
      { value: 7, name: 'Aug' },
      { value: 8, name: 'Sep' },
      { value: 9, name: 'Oct' },
      { value: 10, name: 'Nov' },
      { value: 11, name: 'Dec' }
    ];
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Initialize selected date when profile loads
  useEffect(() => {
    if (profile.dateOfBirth) {
      setSelectedDate(new Date(profile.dateOfBirth));
    }
  }, [profile.dateOfBirth]);

  // Click outside handler for date picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDatePickerOpen && !event.target.closest('.date-picker')) {
        setIsDatePickerOpen(false);
        setIsYearPickerOpen(false);
        setIsMonthPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDatePickerOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-3 py-4">
          {/* Loading State */}
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              {/* Spinning Circle */}
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              {/* User Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <User size={20} className="text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Loading Profile</h3>
              <p className="text-gray-600 text-sm">Fetching your profile information...</p>
            </div>
            {/* Loading Dots */}
            <div className="flex space-x-1 mt-3">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const roleColor = roleColors[profile.role] || roleColors["Team Member"];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-3 py-4">
        {loading ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              {/* Spinning Circle */}
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              {/* User Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <User size={20} className="text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Loading Profile</h3>
              <p className="text-gray-600 text-sm">Fetching your profile information...</p>
            </div>
            {/* Loading Dots */}
            <div className="flex space-x-1 mt-3">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                    <PencilLine size={20} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                    Edit Profile
                  </h1>
                </div>
                
                <div className="w-20"></div> {/* Spacer to center the title */}
              </div>
              
              {/* Mobile Layout - Centered Title */}
              <div className="md:hidden text-center">
                <div className="inline-flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center">
                    <PencilLine size={20} className="text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                    Edit Profile
                  </h1>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-3">
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                Update your profile information and settings
              </p>
            </div>
            
            <div className="flex flex-col-reverse md:flex-row gap-6 items-start animate-fade-in">
              
              {/* RIGHT: Profile Form */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 w-full md:flex-[2]">

                <form onSubmit={handleUpdate} className="space-y-4">
                  {/* Profile Picture Upload */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {file || profile.profilePicture ? (
                        <img
                          src={
                            file
                              ? URL.createObjectURL(file)
                              : getAvatarUrl(profile.profilePicture, profile.name, 96)
                          }
                          alt="Profile"
                          className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <span className="text-white font-bold text-2xl">
                            {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                          </span>
                        </div>
                      )}
                      <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-green-700 transition-colors duration-200 shadow-lg">
                        <Camera size={14} />
                        <input
                          type="file"
                          hidden
                          onChange={handleProfilePictureChange}
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">Profile Picture</h3>
                      <p className="text-gray-600 text-sm">Click the camera icon to change your profile picture</p>
                    </div>
                  </div>

                  {/* Name and Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700 mb-2 block text-sm">Name</label>
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        <User size={18} className="text-gray-400 mr-2" />
                        <input
                          type="text"
                          value={profile.name}
                          disabled
                          className="w-full outline-none bg-transparent text-gray-700 font-medium text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-gray-700 mb-2 block text-sm">Email</label>
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        <Mail size={18} className="text-gray-400 mr-2" />
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full outline-none bg-transparent text-gray-700 font-medium text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gender and Position Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700 mb-2 block text-sm">Gender</label>
                      <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
                        <Venus size={18} className="text-gray-400 mr-2" />
                        <select
                          name="gender"
                          value={profile.gender}
                          onChange={handleChange}
                          className="w-full outline-none text-gray-700 bg-transparent text-sm"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-gray-700 mb-2 block text-sm">Position</label>
                      <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
                        <Briefcase size={18} className="text-gray-400 mr-2" />
                        <input
                          type="text"
                          name="position"
                          value={profile.position || ""}
                          onChange={handleChange}
                          placeholder="e.g. Frontend Developer"
                          className="w-full outline-none text-gray-700 bg-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="relative date-picker">
                    <label className="font-semibold text-gray-700 mb-2 block text-sm">Date of Birth</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="dateOfBirth"
                        value={selectedDate 
                          ? selectedDate.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : ''
                        }
                        placeholder="Select your date of birth"
                        readOnly
                        onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50 cursor-pointer"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <CalendarDays className="w-5 h-5 text-gray-400" />
                      </div>

                                                {/* Calendar Dropdown - Exact design from project/task forms */}
                          {isDatePickerOpen && (
                            <div className="absolute top-0 right-0 -mt-20 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl transform translate-x-full" style={{ zIndex: 9999999 }}>
                              {/* Year Picker Dropdown */}
                              {isYearPickerOpen && (
                                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                  <div className="p-2">
                                    <div className="grid grid-cols-3 gap-1">
                                      {getYearRange().map((year) => (
                                        <button
                                          key={year}
                                          type="button"
                                          onClick={(e) => handleYearSelect(year, e)}
                                          className={`px-2 py-1 text-xs rounded hover:bg-green-50 hover:text-green-700 transition-colors ${
                                            year === currentDate.getFullYear() 
                                              ? 'bg-green-500 text-white' 
                                              : 'text-gray-700'
                                          }`}
                                        >
                                          {year}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Month Picker Dropdown */}
                              {isMonthPickerOpen && (
                                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                  <div className="p-2">
                                    <div className="grid grid-cols-3 gap-1">
                                      {getMonths().map((month) => (
                                        <button
                                          key={month.value}
                                          type="button"
                                          onClick={(e) => handleMonthSelect(month.value, e)}
                                          className={`px-2 py-1 text-xs rounded hover:bg-green-50 hover:text-green-700 transition-colors ${
                                            month.value === currentDate.getMonth() 
                                              ? 'bg-green-500 text-white' 
                                              : 'text-gray-700'
                                          }`}
                                        >
                                          {month.name}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Calendar Header */}
                              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-t-xl">
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  prevMonth(e);
                                }}
                                className="p-1.5 hover:bg-green-600 rounded-lg transition-colors"
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsMonthPickerOpen(!isMonthPickerOpen);
                                    setIsYearPickerOpen(false);
                                  }}
                                  className="px-2 py-1 hover:bg-green-600 rounded text-sm font-semibold transition-colors"
                                >
                                  {currentDate.toLocaleDateString('en-US', { month: 'short' })}
                                </button>
                                <span className="text-sm font-semibold">-</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsYearPickerOpen(!isYearPickerOpen);
                                    setIsMonthPickerOpen(false);
                                  }}
                                  className="px-2 py-1 hover:bg-green-600 rounded text-sm font-semibold transition-colors"
                                >
                                  {currentDate.getFullYear()}
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  nextMonth(e);
                                }}
                                className="p-1.5 hover:bg-green-600 rounded-lg transition-colors"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Calendar Body */}
                          <div className="p-3">
                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-0.5 mb-2">
                              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">{day}</div>
                              ))}
                            </div>
                            {/* Calendar Days */}
                            <div className="grid grid-cols-7 gap-0.5">
                              {getDaysInMonth(currentDate).map((date, index) => (
                                <div key={index} className="aspect-square">
                                  {date ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (!isFutureDate(date)) {
                                          handleDateSelect(date, e);
                                        }
                                      }}
                                      disabled={isFutureDate(date)}
                                      className={`w-full h-full rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center
                                        ${isSelected(date) 
                                          ? 'bg-green-500 text-white shadow-md' 
                                          : isToday(date)
                                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                          : isFutureDate(date)
                                          ? 'text-gray-300 cursor-not-allowed'
                                          : 'text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border hover:border-green-200'
                                        }`}
                                    >
                                      {date.getDate()}
                                    </button>
                                  ) : (
                                    <div className="w-full h-full"></div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Calendar Footer */}
                          <div className="border-t border-gray-100 p-2 bg-gray-50 rounded-b-xl">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-yellow-100 border border-yellow-300 rounded"></div>
                                <span>Today</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded"></div>
                                <span>Selected</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      

                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="font-semibold text-gray-700 mb-2 block text-sm">Bio</label>
                    <div className="relative">
                      <textarea
                        name="bio"
                        value={profile.bio}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Tell us about yourself..."
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 resize-none text-sm"
                      />
                      <Quote size={14} className="absolute top-2 right-2 text-gray-400" />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      Update Profile
                    </button>
                  </div>
                </form>
              </div>

              {/* LEFT: Profile Card - Same Design as Team Members */}
              <div className="w-full md:w-80">
                <div className={`relative overflow-hidden rounded-xl shadow-lg hover:-translate-y-1 transition-transform duration-300 ${roleColor.bg} ${roleColor.border} border-2 min-h-[300px]`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-current to-transparent rounded-full -translate-y-8 translate-x-8"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-current to-transparent rounded-full translate-y-6 -translate-x-6"></div>
                  </div>

                  {/* Card Content */}
                  <div className="relative p-4">
                    {/* Profile Image and Basic Info Row */}
                    <div className="flex items-center mb-3">
                      <div className="relative mr-3">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-lg opacity-75"></div>
                        {file || profile.profilePicture ? (
                          <img
                            src={
                              file
                                ? URL.createObjectURL(file)
                                : getAvatarUrl(profile.profilePicture, profile.name, 48)
                            }
                            alt={profile.name}
                            className="relative w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                          />
                        ) : (
                          <div className="relative w-12 h-12 rounded-full border-2 border-white shadow-md bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                            </span>
                          </div>
                        )}

                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-gray-800 mb-1 truncate">
                          {profile.name}
                        </h2>
                        <div className="flex items-center space-x-1 mb-1">
                          <Mail size={12} className="text-gray-500 flex-shrink-0" />
                          <p className="text-xs text-gray-600 font-medium truncate">{profile.email}</p>
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full ${roleColor.badge} font-semibold text-xs shadow-sm`}>
                          {roleIcons[profile.role]}
                          {profile.role}
                        </div>
                      </div>
                    </div>

                    {/* Profile Details - Compact Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {profile.position && (
                        <div className="flex items-center space-x-2 p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                          <MapPin size={12} className="text-gray-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Position</p>
                            <p className="text-xs font-semibold text-gray-700 truncate">{profile.position}</p>
                          </div>
                        </div>
                      )}
                      
                      {profile.gender && (
                        <div className="flex items-center space-x-2 p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                          <UserCircle size={12} className="text-gray-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Gender</p>
                            <p className="text-xs font-semibold text-gray-700 capitalize">{profile.gender}</p>
                          </div>
                        </div>
                      )}
                      
                      {profile.dateOfBirth && (
                        <div className="flex items-center space-x-2 p-2 bg-white/50 rounded-lg backdrop-blur-sm col-span-2">
                          <CalendarDays size={12} className="text-gray-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Date of Birth</p>
                            <p className="text-xs font-semibold text-gray-700">
                              {new Date(profile.dateOfBirth).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bio Section - Only if exists */}
                    {profile.bio && (
                      <div className="relative p-2 bg-white/60 rounded-lg backdrop-blur-sm">
                        <Quote size={10} className="absolute top-1 left-1 text-gray-400" />
                        <blockquote className="text-xs text-gray-700 italic pl-3">
                          "{profile.bio}"
                        </blockquote>
                      </div>
                    )}

                    {/* Empty State Message */}
                    {!profile.position && !profile.gender && !profile.dateOfBirth && !profile.bio && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No specific details added yet for this profile.</p>
                        <p>Click "Edit Profile" to add your details.</p>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default ProfilePage;
