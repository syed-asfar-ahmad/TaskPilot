import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import Projects from "./pages/Projects";
import AddTaskPage from "./pages/AddTaskPage";
import TaskListPage from "./pages/TaskListPage";
import EditTaskPage from "./pages/EditTaskPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import TaskCalendarPage from "./pages/TaskCalendarPage";
import PrivateRoute from "./utils/PrivateRoute";
import RoleBasedRoute from "./utils/RoleBasedRoute";
import { useAuth } from "./context/AuthContext";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import CreateProject from "./pages/CreateProject";
import EditProjectPage from "./pages/EditProjectPage";
import TeamDashboard from "./pages/TeamDashboard";
import { Toaster } from 'react-hot-toast';
import InLineLoader from "./components/InLineLoader";
import ProfilePage from "./pages/ProfilePage";
import AllMembersPage from "./pages/AllMembersPage";
import TeamDetailPage from "./pages/TeamDetailPage";

import ForgetPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import ContactMessagesPage from "./pages/ContactMessagesPage";
import ChatPage from "./pages/ChatPage";
import NotificationsPage from './pages/NotificationsPage.jsx';


function AppRoutes() {
  const { token, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="text-center mt-10">
        <InLineLoader message="Loading User Information" />
      </div>
    );
  }


  return (
    <>
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            fontWeight: '500',
            border: '1px solid #16a34a',
            padding: '12px 16px',
            boxShadow: '0 2px 16px 0 rgba(16,185,129,0.08)',
          },
          success: {
            iconTheme: {
              primary: '#16a34a',
              secondary: '#fff',
            },
            style: {
              border: '1.5px solid #16a34a',
              color: '#166534',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
            style: {
              border: '1.5px solid #dc2626',
              color: '#991b1b',
            },
          },
        }}
        // Always show progress bar
        containerStyle={{}}
        toast={(t) => (
          <div className="flex items-center gap-3">
            {t.icon}
            <div className="flex-1">{t.message}</div>
            <div className="w-24 h-1 bg-green-500 rounded-full animate-pulse absolute bottom-0 left-0" style={{ width: `${(1 - t.visible) * 100}%` }} />
          </div>
        )}
      />
      <Routes>
        <Route
          path="/login"
          element={
            token ? (
              user?.role === "Team Member"
                ? <Navigate to="/team-dashboard" />
                : user?.role === "Manager"
                ? <Navigate to="/manager-dashboard" />
                : <Navigate to="/dashboard" />
            ) : <Login />
          }
        />
        <Route path="/signup" element={token ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/forget-password" element={token ? <Navigate to="/dashboard" /> : <ForgetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <RoleBasedRoute allowedRoles={["Admin"]}>
            <AdminDashboard />
          </RoleBasedRoute>
        } />
        <Route path="/manager-dashboard" element={
          <RoleBasedRoute allowedRoles={["Manager"]}>
            <ManagerDashboard />
          </RoleBasedRoute>
        } />
        <Route path="/team-dashboard" element={
          <RoleBasedRoute allowedRoles={["Team Member"]}>
            <TeamDashboard />
          </RoleBasedRoute>
        } />
        <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute><TaskListPage /></PrivateRoute>} />
        <Route path="/tasks/:id" element={<PrivateRoute><TaskDetailPage /></PrivateRoute>} />
        <Route path="/calendar" element={<PrivateRoute><TaskCalendarPage /></PrivateRoute>} />

        <Route path="/projects/edit/:id" element={<EditProjectPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/members" element={<AllMembersPage />} />
        <Route path="/teams/:id" element={<PrivateRoute><TeamDetailPage /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/contact-messages" element={
          <RoleBasedRoute allowedRoles={["Admin"]}>
            <ContactMessagesPage />
          </RoleBasedRoute>
        } />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Role-based Routes */}
        <Route path="/add-task" element={
          <RoleBasedRoute allowedRoles={["Admin", "Manager"]}>
            <AddTaskPage />
          </RoleBasedRoute>
        } />
        <Route path="/tasks/:id/edit" element={
          <RoleBasedRoute allowedRoles={["Admin", "Manager", "Team Member"]}>
            <EditTaskPage />
          </RoleBasedRoute>
        } />

        <Route
            path="/projects/:id"
            element={
                <PrivateRoute>
                    <ProjectDetailPage />
                </PrivateRoute>
        }
        />
        {/* Catch-all route */}
        <Route path="*" element={
          token ? (
            user?.role === "Team Member"
              ? <Navigate to="/team-dashboard" />
              : user?.role === "Manager"
              ? <Navigate to="/manager-dashboard" />
              : <Navigate to="/dashboard" />
          ) : <Navigate to="/login" />
        } />
        <Route path="/projects/create" element={
          <RoleBasedRoute allowedRoles={["Admin", "Manager"]}>
            <CreateProject />
          </RoleBasedRoute>
        } />
      </Routes>
    </>
  );
}

export default AppRoutes;
