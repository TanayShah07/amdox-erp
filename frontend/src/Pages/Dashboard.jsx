import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();

  const [employeesCount, setEmployeesCount] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);

  const token = localStorage.getItem("token");

  // 🔐 FETCH DASHBOARD
  const fetchDashboard = async () => {
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ❗ VERY IMPORTANT (handle unauthorized)
      if (!res.ok) {
        console.log("Unauthorized - redirecting");
        localStorage.removeItem("token");
        navigate("/");
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

    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-gray-900 text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8">ERP</h2>

        <button className="mb-3 text-left px-3 py-2 rounded bg-gray-700">
          Dashboard
        </button>

        <button
          onClick={() => navigate("/employees")}
          className="mb-3 text-left px-3 py-2 rounded hover:bg-gray-700"
        >
          Employees
        </button>

        <button
          onClick={logout}
          className="mt-auto text-left px-3 py-2 rounded text-red-400 hover:bg-gray-700"
        >
          Logout
        </button>
      </div>

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3>Total Employees</h3>
            <p className="text-2xl font-bold">{employeesCount}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3>Total Salary</h3>
            <p className="text-2xl font-bold">{totalSalary}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3>Total Projects</h3>
            <p className="text-2xl font-bold">{totalProjects}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;