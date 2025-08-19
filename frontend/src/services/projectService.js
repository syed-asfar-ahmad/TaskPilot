import axios from "axios";

const API = process.env.REACT_APP_API_BASE_URL;

export const getAllProjects = async (token) => {
  return await axios.get(`${API}/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createProject = async (data, token) => {
  return await axios.post(`${API}/projects`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
