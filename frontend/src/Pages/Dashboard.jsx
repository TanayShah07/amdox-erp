import { useEffect, useState } from "react";
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
  const [stats, setStats] = useState({
    employees: 0,
    salary: 0,
    projects: 0,
    completedProjects: 0,
    pendingProjects: 0,
  });

  const [employeeGrowthData, setEmployeeGrowthData] =
    useState([]);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/dashboard-stats"
      );

      const data = await res.json();

      setStats(data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchEmployeeGrowth = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/employee-growth"
      );

      const data = await res.json();

      setEmployeeGrowthData(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchEmployeeGrowth();
    fetchSalaryOverview();
  }, []);

  const [salaryData, setSalaryData] =
    useState([]);
   
   const fetchSalaryOverview = async () => {
  try {
    const res = await fetch(
      "http://localhost:5000/api/salary-overview"
    );

    const data = await res.json();

    setSalaryData(data);
  } catch (err) {
    console.log(err);
  }
}; 

  const projectData = [
    {
      name: "Completed",
      value: stats.completedProjects,
    },
    {
      name: "Pending",
      value: stats.pendingProjects,
    },
  ];

  const COLORS = [
    "#10B981",
    "#F59E0B",
  ];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  const pageTitleStyle = {
    fontSize: "32px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "24px",
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 style={pageTitleStyle}>
          Dashboard
        </h1>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl shadow"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-gray-500">
            Total Employees
          </h3>

          <p className="text-3xl font-bold text-blue-600">
            {stats.employees}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-gray-500">
            Total Salary
          </h3>

          <p className="text-3xl font-bold text-green-600">
            ₹ {stats.salary}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-gray-500">
            Total Projects
          </h3>

          <p className="text-3xl font-bold text-purple-600">
            {stats.projects}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">
            Employee Growth
          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <BarChart data={employeeGrowthData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="employees"
                fill="#3B82F6"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">
            Salary Overview
          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
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

        <div className="bg-white p-6 rounded-2xl shadow lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">
            Project Status
          </h2>

          <ResponsiveContainer
            width="100%"
            height={350}
          >
            <PieChart>
              <Pie
                data={projectData}
                dataKey="value"
                outerRadius={120}
                label
              >
                {projectData.map(
                  (_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index]}
                    />
                  )
                )}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}