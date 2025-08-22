import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import AuthNavbar from "../components/AuthNavbar";
import Footer from "../components/Footer";
import {
  ClipboardList,
  Briefcase,
  CalendarDays,
  NotebookPen,
  FileText,
  CheckSquare,
  Calendar,
  ArrowRight,
  Users,
} from "lucide-react";

const API = process.env.REACT_APP_API_BASE_URL || 'https://taskpilot-1-mzxb.onrender.com/api';

function Dashboard() {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTasksPage, setCurrentTasksPage] = useState(1);
  const [currentProjectsPage, setCurrentProjectsPage] = useState(1);
  const [tasksPerPage] = useState(4);
  const [projectsPerPage] = useState(4);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

}