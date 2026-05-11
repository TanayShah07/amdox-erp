import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Chatbot from "../components/Chatbot";

export default function Dashboard() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(true);

  const [employeesCount, setEmployeesCount] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);

  const token = localStorage.getItem("token");

  const fetchEmployees = async () => {
    if (!token) {
      navigate("/");
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
        navigate("/");
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
      navigate("/");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
    fetchEmployees();

    const interval = setInterval(fetchDashboard, 5000);

    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

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

            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-gray-500 mb-2">
                Total Employees
              </h3>

              <p className="text-2xl font-bold">
                {employeesCount}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-gray-500 mb-2">
                Total Salary
              </h3>

              <p className="text-2xl font-bold">
                ₹ {totalSalary}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-gray-500 mb-2">
                Total Projects
              </h3>

              <p className="text-2xl font-bold">
                {totalProjects}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Chatbot />
          </div>
        </div>
      </div>
    </div>
  );
}