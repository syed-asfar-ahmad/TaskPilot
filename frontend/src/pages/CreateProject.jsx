import { FolderPlus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthNavbar from "../components/AuthNavbar";
import Footer from "../components/Footer";
import AddProjectForm from "../components/AddProjectForm";
import BackButton from '../components/backButton';
import { toast } from 'react-hot-toast'; 

function CreateProject() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/projects");
  };

  return (
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-100">
      <AuthNavbar />
      <main className="flex-1 w-full px-6 py-12">
        <div className="w-full max-w-[1000px] mx-auto min-h-[400px]">
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
                <FolderPlus size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                Create New Project
              </h1>
            </div>
            
            <div className="w-20"></div> {/* Spacer to center the title */}
          </div>
          
          {/* Mobile Layout - Centered Title */}
          <div className="md:hidden text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center">
                <FolderPlus size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                Create New Project
              </h1>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-3">
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Provide essential details below to add a new project to your workspace.
          </p>
        </div>

        {/* Clean form, already styled inside */}
        <AddProjectForm onProjectCreated={handleSuccess} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CreateProject;
