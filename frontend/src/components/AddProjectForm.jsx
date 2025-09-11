import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { createProject } from "../services/projectService";
import axios from "axios";
import Select from "react-select";
import { CalendarDays, Users, ClipboardList, FileText, ListChecks, UserCheck, Clock, PlayCircle, CheckCircle, ChevronLeft, ChevronRight, AlignLeft, BarChart3 } from "lucide-react";
import { toast } from "react-hot-toast";

const API = process.env.REACT_APP_API_BASE_URL || 'https://taskpilot-1-mzxb.onrender.com/api';


function AddProjectForm({ onProjectCreated }) {
  const { token, user } = useAuth();

  const [teamOptions, setTeamOptions] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: { value: "Pending", label: "Pending" },
    deadline: "",
    projectManager: "",
    teamMembers: [],
  });

  const [errors, setErrors] = useState({});

  // Status options with icons and colors
  const statusOptions = [
    {
      value: "Pending",
      label: "Pending",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    },
    {
      value: "In Progress",
      label: "In Progress",
      icon: PlayCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      value: "Completed",
      label: "Completed",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        let teamRes;
        
        if (user.role === 'Manager') {
          // For managers, fetch only their team members
          teamRes = await axios.get(`${API}/users/my-team-members`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          // For admins, fetch all team members and managers
          const [teamMembersRes, managersRes] = await Promise.all([
            axios.get(`${API}/users/team-members`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API}/users/managers`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          ]);
          
          // Combine team members and managers for admin
          const allUsers = [...teamMembersRes.data, ...managersRes.data];
          teamRes = { data: allUsers };
        }

        const teamOptions = teamRes.data.map((member) => ({
          value: member._id,
          label: `${member.name} (${member.email})`,
          profilePicture: member.profilePicture || null,
          name: member.name,
          email: member.email
        }));

        setTeamOptions(teamOptions);
      } catch (err) {
        // Error handling without console logging
      }
    };

    fetchData();
  }, [token, user.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleStatusChange = (selectedOption) => {
    setForm((prev) => ({ ...prev, status: selectedOption }));
  };

  const handleTeamChange = (selectedOptions) => {
    const selectedIds = selectedOptions.map((opt) => opt.value);
    setForm((prev) => ({ ...prev, teamMembers: selectedIds }));
    
    // Clear team members error when user selects
    if (errors.teamMembers) {
      setErrors((prev) => ({ ...prev, teamMembers: null }));
    }
  };

  // Custom Calendar Functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateSelect = (date) => {
    setForm(prev => ({ ...prev, deadline: formatDate(date) }));
    setShowCalendar(false);
    
    // Clear deadline error when user selects date
    if (errors.deadline) {
      setErrors((prev) => ({ ...prev, deadline: null }));
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return form.deadline === formatDate(date);
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate required fields
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = "Project name is required";
    }
    
    if (!form.description.trim()) {
      newErrors.description = "Project description is required";
    }
    
    if (!form.deadline) {
      newErrors.deadline = "Project deadline is required";
    }
    
    if (!form.teamMembers || form.teamMembers.length === 0) {
      newErrors.teamMembers = "At least one team member must be selected";
    }
    
    // If there are validation errors, set them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      // Convert status object to string for API and teamMembers to IDs
      const projectData = {
        ...form,
        status: form.status.value,
        teamMembers: form.teamMembers // teamMembers are already IDs from handleTeamChange
      };
      
      await createProject(projectData, token);
      toast.success("Project created successfully!");

      setForm({
        name: "",
        description: "",
        status: { value: "Pending", label: "Pending" },
        deadline: "",
        projectManager: "",
        teamMembers: [],
      });

      if (onProjectCreated) onProjectCreated();
    } catch (err) {
      toast.error(`Failed to create project: ${err.response?.data?.error || err.message}`);
    }
  };


  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white border border-gray-200 rounded-xl shadow-lg px-10 py-8 w-full min-h-[600px]"
    >
              <div className="flex items-center mb-6 text-green-700">
        <ClipboardList className="w-6 h-6 mr-2" />
        <h2 className="text-2xl font-bold">Project Details</h2>
      </div>

             <div>
         <label className="block mb-1 font-medium text-gray-700 flex items-center">
           <FileText className="w-4 h-4 mr-1" />
           Project Name <span className="text-red-500 ml-1">*</span>
         </label>
        <input
          type="text"
          name="name"
          placeholder="Enter project name"
          value={form.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-200 ${
            errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
          }`}
          required
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

                           <div>
          <label className="block mb-1 font-medium text-gray-700 flex items-center">
            <AlignLeft className="w-4 h-4 mr-1" />
            Description <span className="text-red-500 ml-1">*</span>
          </label>
        <textarea
          name="description"
          placeholder="Brief project description"
          value={form.description}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-200 ${
            errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
          }`}
          rows={4}
          required
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

                                                       <div>
           <label className="block mb-1 font-medium text-gray-700 flex items-center">
             <ListChecks className="w-4 h-4 mr-1" />
             Status <span className="text-red-500 ml-1">*</span>
           </label>
        <Select
          value={form.status}
          onChange={handleStatusChange}
          options={statusOptions}
          placeholder="Select project status..."
          className="react-select-container"
          classNamePrefix="react-select"
          menuPortalTarget={document.body}
          styles={{
            control: (base, state) => ({
              ...base,
              minHeight: '42px',
              border: state.isFocused ? '2px solid #16a34a' : '1px solid #d1d5db',
              borderRadius: '8px',
              boxShadow: state.isFocused ? '0 0 0 3px rgba(22, 163, 74, 0.1)' : 'none',
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
              '&:hover': {
                backgroundColor: state.isSelected ? '#16a34a' : '#f0fdf4'
              }
            }),
            menu: (base) => ({
              ...base,
              borderRadius: '8px',
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
             valueContainer: (base) => ({
               ...base,
               display: 'flex',
               alignItems: 'center',
               gap: '8px',
               cursor: 'pointer'
             }),
             input: (base) => ({
               ...base,
               cursor: 'pointer',
               caretColor: 'transparent'
             })
          }}
                     formatOptionLabel={(option) => {
             return (
               <div className="flex items-center space-x-3">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${option.bgColor} ${option.borderColor} border`}>
                   {option.value === "Pending" && <Clock size={16} className={option.color} />}
                   {option.value === "In Progress" && <PlayCircle size={16} className={option.color} />}
                   {option.value === "Completed" && <CheckCircle size={16} className={option.color} />}
                 </div>
                 <span className="font-medium">{option.label}</span>
               </div>
             );
           }}
           formatValueLabel={(option) => {
             return (
               <div className="flex items-center space-x-2">
                 <div className={`w-6 h-6 rounded-full flex items-center justify-center ${option.bgColor} ${option.borderColor} border`}>
                   {option.value === "Pending" && <Clock size={14} className={option.color} />}
                   {option.value === "In Progress" && <PlayCircle size={14} className={option.color} />}
                   {option.value === "Completed" && <CheckCircle size={14} className={option.color} />}
                 </div>
                 <span className="font-medium">{option.label}</span>
               </div>
             );
           }}
        />
      </div>

                                                       <div>
           <label className="block mb-1 font-medium text-gray-700 flex items-center">
             <CalendarDays className="w-4 h-4 mr-1" />
             Deadline <span className="text-red-500 ml-1">*</span>
           </label>
          <div className="relative">
            <input
              type="text"
              name="deadline"
              value={form.deadline ? new Date(form.deadline).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              }) : ''}
              placeholder="Select deadline date"
              readOnly
              onClick={() => setShowCalendar(!showCalendar)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50 cursor-pointer ${
                errors.deadline ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <CalendarDays className="w-5 h-5 text-gray-400" />
            </div>
            
                         {/* Custom Calendar Popup */}
             {showCalendar && (
               <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50">
                 {/* Calendar Header */}
                 <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-t-xl">
                   <div className="flex items-center justify-between">
                                           <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          goToPreviousMonth();
                        }}
                        className="p-1.5 hover:bg-green-600 rounded-lg transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                     <h3 className="text-sm font-semibold">
                       {currentDate.toLocaleDateString('en-US', { 
                         month: 'short', 
                         year: 'numeric' 
                       })}
                     </h3>
                                           <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          goToNextMonth();
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
                     {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                       <div key={`day-${index}`} className="text-center text-xs font-medium text-gray-500 py-1">
                         {day}
                       </div>
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
                                handleDateSelect(date);
                              }}
                              disabled={isPastDate(date)}
                              className={`w-full h-full rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center
                                ${isSelected(date) 
                                  ? 'bg-green-500 text-white shadow-md' 
                                  : isToday(date)
                                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                  : isPastDate(date)
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
          
          {/* Click outside to close calendar */}
          {showCalendar && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowCalendar(false)}
            />
          )}
          
          {errors.deadline && (
            <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>
          )}
          {form.deadline && !errors.deadline && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Deadline set for: {new Date(form.deadline).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          )}
        </div>

      

             <div>
         <label className="block mb-1 font-medium text-gray-700 flex items-center">
           <Users className="w-4 h-4 mr-1" />
           Assign Team Members <span className="text-red-500 ml-1">*</span>
         </label>
         <Select
           isMulti
           options={teamOptions}
           onChange={handleTeamChange}
           placeholder="Select team members..."
           className="react-select-container"
           classNamePrefix="react-select"
           menuPortalTarget={document.body}
           styles={{
             control: (base, state) => ({
               ...base,
               minHeight: '42px',
               border: state.isFocused 
                 ? '2px solid #16a34a' 
                 : errors.teamMembers 
                 ? '2px solid #dc2626' 
                 : '1px solid #d1d5db',
               borderRadius: '8px',
               boxShadow: state.isFocused ? '0 0 0 3px rgba(22, 163, 74, 0.1)' : 'none',
               cursor: 'pointer',
               '&:hover': {
                 border: state.isFocused 
                   ? '2px solid #16a34a' 
                   : errors.teamMembers 
                   ? '2px solid #dc2626' 
                   : '2px solid #16a34a'
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
               '&:hover': {
                 backgroundColor: state.isSelected ? '#16a34a' : '#f0fdf4'
               }
             }),
             menu: (base) => ({
               ...base,
               borderRadius: '8px',
               boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
               border: '1px solid #e5e7eb'
             }),
             menuPortal: (base) => ({
               ...base,
               zIndex: 9999
             }),
                           multiValue: (base) => ({
                ...base,
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: '#166534',
                fontWeight: '500',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }),
             multiValueRemove: (base) => ({
               ...base,
               color: '#dc2626',
               '&:hover': {
                 backgroundColor: '#fef2f2',
                 color: '#dc2626'
               }
             }),
             valueContainer: (base) => ({
               ...base,
               padding: '8px 12px',
               gap: '6px'
             }),
             placeholder: (base) => ({
               ...base,
               color: '#9ca3af',
               fontSize: '14px'
             })
           }}
                       formatOptionLabel={(option) => (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                  {option.profilePicture ? (
                    <img 
                      src={option.profilePicture} 
                      alt={option.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ display: option.profilePicture ? 'none' : 'flex' }}>
                    {option.name.split(' ')[0].charAt(0).toUpperCase()}
                    {option.name.split(' ')[1] ? option.name.split(' ')[1].charAt(0).toUpperCase() : ''}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.name}</div>
                  <div className="text-sm text-gray-500">{option.email}</div>
                </div>
              </div>
            )}
            formatMultiValueLabel={(option) => (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center">
                  {option.profilePicture ? (
                    <img 
                      src={option.profilePicture} 
                      alt={option.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-xs" style={{ display: option.profilePicture ? 'none' : 'flex' }}>
                    {option.name.split(' ')[0].charAt(0).toUpperCase()}
                    {option.name.split(' ')[1] ? option.name.split(' ')[1].charAt(0).toUpperCase() : ''}
                  </div>
                </div>
                <span>{option.name}</span>
              </div>
            )}
         />
         {errors.teamMembers && (
           <p className="text-red-500 text-sm mt-1">{errors.teamMembers}</p>
         )}
       </div>

      <button
        type="submit"
        className="w-full bg-green-600 text-white font-medium py-2 rounded-lg hover:bg-green-700 transition"
      >
        Create Project
      </button>
    </form>
  );
}

export default AddProjectForm;
