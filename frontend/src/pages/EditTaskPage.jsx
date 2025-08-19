import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/AuthNavbar';
import Footer from '../components/Footer';
import { Pencil, XCircle, CheckSquare, ArrowLeft, Save, FileText, AlignLeft, CalendarDays, ListChecks, AlertTriangle, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import BackButton from '../components/backButton';
import toast from 'react-hot-toast';

const API = process.env.REACT_APP_API_BASE_URL;

function EditTaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '',
    assignedTo: [],
  });

  const [teamOptions, setTeamOptions] = useState([]);
  const [assignedOption, setAssignedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(form.dueDate ? new Date(form.dueDate) : new Date());
  const [isAssignedTeamMember, setIsAssignedTeamMember] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const taskRes = await axios.get(`${API}/tasks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const task = taskRes.data;
        const projectId = task.project?._id || task.project;

        // Check if current user is assigned team member
        const isAssigned = task.assignedTo.some(assignedUser => 
          (assignedUser._id || assignedUser) === user?._id
        );
        setIsAssignedTeamMember(isAssigned && user?.role === 'Team Member');

        // Only fetch team members if project exists and user is not assigned team member
        if (projectId && !isAssignedTeamMember) {
          try {
            const teamRes = await axios.get(`${API}/projects/${projectId}/team-members`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const options = teamRes.data.map((user) => ({
              value: user._id,
              label: `${user.name} (${user.email})`,
              profilePicture: user.profilePicture,
              name: user.name,
              email: user.email,
            }));

            setTeamOptions(options);

            const selected = options.find(
              (opt) => (task.assignedTo[0]?._id || task.assignedTo[0]) === opt.value
            );

            setAssignedOption(selected || null);
          } catch (err) {
            setTeamOptions([]);
            setAssignedOption(null);
          }
        } else {
          // If no project or user is assigned team member, set empty options
          setTeamOptions([]);
          setAssignedOption(null);
        }

        setForm({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate?.slice(0, 10) || '',
          assignedTo: task.assignedTo.map((u) => u._id || u),
        });
      } catch (err) {
        toast.error('Failed to load task details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, user, isAssignedTeamMember]);

  const handleChange = (e) => {
    // Only allow changes if user is not assigned team member, or if it's the status field
    if (!isAssignedTeamMember || e.target.name === 'status') {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isAssignedTeamMember) {
        // Team member can only update status
        await axios.put(
          `${API}/tasks/${id}`,
          { status: form.status },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success('Task status updated successfully!');
      } else {
        // Manager can update all fields
        await axios.put(
          `${API}/tasks/${id}`,
          {
            ...form,
            assignedTo: assignedOption ? [assignedOption.value] : [],
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success('Task updated successfully!');
      }
      setTimeout(() => navigate(`/tasks/${id}`), 500);
    } catch (err) {
      toast.error(isAssignedTeamMember ? 'Failed to update task status' : 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/tasks/${id}`);
  };

  // Calendar logic from AddProjectForm
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };
  const formatDate = (date) => date.toISOString().split('T')[0];
  const handleDateSelect = (date) => {
    setForm((prev) => ({ ...prev, dueDate: formatDate(date) }));
    setShowCalendar(false);
  };
  const goToPreviousMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  const isSelected = (date) => form.dueDate === formatDate(date);
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
          {/* Loading State */}
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              {/* Spinning Circle */}
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              {/* Task Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckSquare size={20} className="text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Loading Task Details</h3>
              <p className="text-gray-600 text-sm">Fetching task information...</p>
            </div>
            {/* Loading Dots */}
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
      <Navbar />
      <main className="flex-1 w-full px-4 py-8">
        <div className="w-full max-w-[1000px] mx-auto">
        {/* Header with Back Button and Title - Responsive */}
        <div className="w-full max-w-[1000px] mx-auto mb-4">
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
                <Pencil size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                {isAssignedTeamMember ? 'Update Task Status' : 'Edit Task'}
              </h1>
            </div>
            
            <div className="w-20"></div> {/* Spacer to center the title */}
          </div>
          
          {/* Mobile Layout - Centered Title */}
          <div className="md:hidden text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center">
                <Pencil size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                {isAssignedTeamMember ? 'Update Task Status' : 'Edit Task'}
              </h1>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-3">
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            {isAssignedTeamMember ? 'Update the status of your assigned task' : 'Update task information and settings'}
          </p>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6 w-full min-h-[600px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText size={16} className="inline-block mr-2 mb-1" /> Task Title <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  disabled={isAssignedTeamMember}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    isAssignedTeamMember ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter task title"
                  required
                />
              </div>
              {/* Due Date with Calendar */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <CalendarDays size={16} className="inline-block mr-2 mb-1" /> Due Date <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="dueDate"
                    value={form.dueDate ? new Date(form.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                    placeholder="Select due date"
                    readOnly
                    disabled={isAssignedTeamMember}
                    onClick={() => !isAssignedTeamMember && setShowCalendar(!showCalendar)}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      isAssignedTeamMember ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'
                    }`}
                    required
                  />
                  {showCalendar && !isAssignedTeamMember && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50">
                      {/* Calendar Header */}
                      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-t-xl">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToPreviousMonth(); }}
                            className="p-1.5 hover:bg-green-600 rounded-lg transition-colors"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <h3 className="text-sm font-semibold">
                            {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </h3>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToNextMonth(); }}
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
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDateSelect(date); }}
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
                  {/* Click outside to close calendar */}
                  {showCalendar && !isAssignedTeamMember && (
                    <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)} />
                  )}
                  {form.dueDate && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Due date set for: {new Date(form.dueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div> {/* CLOSE grid grid-cols-1 md:grid-cols-2 gap-6 */}
            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <AlignLeft size={16} className="inline-block mr-2 mb-1" /> Description <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                disabled={isAssignedTeamMember}
                rows="4"
                required
                className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none ${
                  isAssignedTeamMember ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                }`}
                placeholder="Enter task description"
              ></textarea>
            </div>
            {/* Status, Priority, and Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-2">
                   <ListChecks size={16} className="inline-block mr-2 mb-1" /> Status <span className="text-red-500 ml-1">*</span>
                 </label>
                <Select
                  options={[
                    { value: 'To Do', label: 'To Do' },
                    { value: 'In Progress', label: 'In Progress' },
                    { value: 'Completed', label: 'Completed' },
                  ]}
                  value={{ value: form.status, label: form.status }}
                  onChange={(selected) => setForm({ ...form, status: selected.value })}
                  isDisabled={false} // Status is always editable
                  className="mt-1"
                  placeholder="Select status"
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      minHeight: '48px',
                      border: state.isFocused ? '2px solid #10b981' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
                      '&:hover': {
                        border: '1px solid #10b981'
                      }
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#f0fdf4' : 'white',
                      color: state.isSelected ? 'white' : '#374151',
                      '&:hover': {
                        backgroundColor: state.isSelected ? '#10b981' : '#f0fdf4'
                      }
                    })
                  }}
                  formatOptionLabel={(option) => (
                    <div className="flex items-center">
                      <span>{option.label}</span>
                    </div>
                  )}
                  formatValueLabel={(option) => (
                    <div className="flex items-center">
                      <span>{option.label}</span>
                    </div>
                  )}
                />
              </div>

                             <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-2">
                   <AlertTriangle size={16} className="inline-block mr-2 mb-1" /> Priority <span className="text-red-500 ml-1">*</span>
                 </label>
                <Select
                  options={[
                    { value: 'Low', label: 'Low' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'High', label: 'High' },
                  ]}
                  value={{ value: form.priority, label: form.priority }}
                  onChange={(selected) => setForm({ ...form, priority: selected.value })}
                  isDisabled={isAssignedTeamMember}
                  className="mt-1"
                  placeholder="Select priority"
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      minHeight: '48px',
                      border: state.isFocused ? '2px solid #10b981' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
                      backgroundColor: isAssignedTeamMember ? '#f3f4f6' : 'white',
                      '&:hover': {
                        border: isAssignedTeamMember ? '1px solid #d1d5db' : '1px solid #10b981'
                      }
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#f0fdf4' : 'white',
                      color: state.isSelected ? 'white' : '#374151',
                      '&:hover': {
                        backgroundColor: state.isSelected ? '#10b981' : '#f0fdf4'
                      }
                    })
                  }}
                  formatOptionLabel={(option) => (
                    <div className="flex items-center">
                      <span>{option.label}</span>
                    </div>
                  )}
                  formatValueLabel={(option) => (
                    <div className="flex items-center">
                      <span>{option.label}</span>
                    </div>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users size={16} className="inline-block mr-2 mb-1" /> Assign To <span className="text-red-500 ml-1">*</span>
                </label>
                <Select
                  isMulti={false}
                  options={teamOptions}
                  value={assignedOption}
                  onChange={(selected) => setAssignedOption(selected)}
                  isDisabled={isAssignedTeamMember}
                  className="mt-1"
                  placeholder="Select team member"
                  formatOptionLabel={(option) => (
                    <div className="flex items-center">
                      {option.profilePicture ? (
                        <img src={option.profilePicture} alt={option.label} className="w-5 h-5 rounded-full mr-2" />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold">
                          {option.label.split(' ')[0][0]}
                        </span>
                      )}
                      <span>{option.label}</span>
                    </div>
                  )}
                  formatValueLabel={(option) => (
                    <div className="flex items-center">
                      {option.profilePicture ? (
                        <img src={option.profilePicture} alt={option.label} className="w-5 h-5 rounded-full mr-2" />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold">
                          {option.label.split(' ')[0][0]}
                        </span>
                      )}
                      <span>{option.label}</span>
                    </div>
                  )}
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      minHeight: '48px',
                      border: state.isFocused ? '2px solid #10b981' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
                      backgroundColor: isAssignedTeamMember ? '#f3f4f6' : 'white',
                      '&:hover': {
                        border: isAssignedTeamMember ? '1px solid #d1d5db' : '1px solid #10b981'
                      }
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#f0fdf4' : 'white',
                      color: state.isSelected ? 'white' : '#374151',
                      '&:hover': {
                        backgroundColor: state.isSelected ? '#10b981' : '#f0fdf4'
                      }
                    })
                  }}
                />
              </div>
            </div>

                         {/* Action Buttons */}
             <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
               <button
                 type="button"
                 onClick={handleCancel}
                 className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors justify-center"
               >
                 <XCircle size={18} /> Cancel
               </button>

               <button
                 type="submit"
                 disabled={submitting}
                 className={`flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors justify-center ${
                   submitting ? 'opacity-70 cursor-not-allowed' : ''
                 }`}
               >
                 <Save size={18} />
                 {submitting ? 'Updating...' : (isAssignedTeamMember ? 'Update Status' : 'Update Task')}
               </button>
             </div>
          </form>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default EditTaskPage;
