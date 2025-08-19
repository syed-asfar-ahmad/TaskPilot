import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-hot-toast';

const API = process.env.REACT_APP_API_BASE_URL;

function ProjectList() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API}/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProjects(res.data);
      } catch (err) {
        toast.error('Failed to load projects');
      }
    };

    fetchProjects();
  }, [token]);

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Project List</h2>

      {projects.length === 0 ? (
        <p>No projects available.</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Deadline</th>
              <th className="p-2 border">Team Members</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project._id} className="border-t">
                <td className="p-2 border">{project.name}</td>
                <td className="p-2 border">{project.description}</td>
                <td className="p-2 border">{project.status}</td>
                <td className="p-2 border">
                  {new Date(project.deadline).toLocaleDateString()}
                </td>
                <td className="p-2 border">
                  {project.teamMembers && project.teamMembers.length > 0 ? (
                    <ul className="list-disc pl-4">
                      {project.teamMembers.map((member) => (
                        <li key={member._id}>
                          {member.name} ({member.email})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <em>No members</em>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProjectList;
