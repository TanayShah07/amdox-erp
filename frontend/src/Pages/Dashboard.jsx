import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Chatbot from "../components/Chatbot";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(true);

  const [employeesCount, setEmployeesCount] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);

  const token = localStorage.getItem("token");

  const fetchEmployees = async () => {
    if (!token) {
      window.location.replace("/");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.replace("/");
        return;
      }

      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDashboard = async () => {
    if (!token) {
      window.location.replace("/");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        console.log("Unauthorized - redirecting");

        localStorage.removeItem("token");

        window.location.replace("/");

        return;
      }

      const data = await res.json();

      setEmployeesCount(data.totalEmployees);
      setTotalSalary(data.totalSalary);
      setTotalProjects(data.totalProjects);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchEmployees();

    const interval = setInterval(() => {
      if (localStorage.getItem("token")) {
        fetchDashboard();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");

    window.location.replace("/");
  };

  // Chart Data
  const employeeGrowthData = [
    { month: "Jan", employees: 20 },
    { month: "Feb", employees: 35 },
    { month: "Mar", employees: 45 },
    { month: "Apr", employees: 60 },
    { month: "May", employees: employeesCount || 75 },
  ];

  const salaryData = [
    { month: "Jan", salary: 40000 },
    { month: "Feb", salary: 60000 },
    { month: "Mar", salary: 75000 },
    { month: "Apr", salary: 85000 },
    { month: "May", salary: totalSalary || 100000 },
  ];

  const projectData = [
    { name: "Completed", value: 70 },
    { name: "Pending", value: 30 },
  ];

  const COLORS = ["#10B981", "#F59E0B"];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        className={`flex-1 transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="p-6 pt-20">
          <div className="flex items-center gap-4 mb-6">
            {!isOpen && (
              <button
                onClick={() => setIsOpen(true)}
                className="bg-white p-2 rounded shadow"
              >
                ☰
              </button>
            )}

            <h1 className="text-3xl font-bold">
              Dashboard
            </h1>

          
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-gray-500 mb-2">
                Total Employees
              </h3>

              <p className="text-2xl font-bold text-blue-600">
                {employeesCount}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-gray-500 mb-2">
                Total Salary
              </h3>

              <p className="text-2xl font-bold text-green-600">
                ₹ {totalSalary}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-gray-500 mb-2">
                Total Projects
              </h3>

              <p className="text-2xl font-bold text-purple-600">
                {totalProjects}
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Employee Growth */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">
                Employee Growth
              </h2>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={employeeGrowthData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  <Bar
                    dataKey="employees"
                    fill="#3B82F6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Salary Overview */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">
                Salary Overview
              </h2>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salaryData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="salary"
                    stroke="#10B981"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Project Status */}
            <div className="bg-white p-6 rounded-xl shadow lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">
                Project Status
              </h2>

              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={projectData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    label
                  >
                    {projectData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chatbot */}
          <div className="mt-8">
            <Chatbot />
          </div>
        </div>
      </div>
    </div>
  );
}