import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";

export default function Employees() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(true);

  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [projects, setProjects] = useState("");

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [editId, setEditId] = useState(null);

  const getToken = () => localStorage.getItem("token");

  // 🔐 FETCH EMPLOYEES
  const fetchEmployees = async () => {
    const token = getToken();

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const params = new URLSearchParams();

      if (search) params.append("search", search);
      if (filterRole) params.append("role", filterRole);

      const res = await fetch(
        `http://localhost:5000/employees?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }
      }

      const data = await res.json();

      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch employees");
    }
  };

  // 🔐 FETCH ROLES
  const fetchRoles = async () => {
    const token = getToken();

    try {
      const res = await fetch("http://localhost:5000/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const uniqueRoles = [
        ...new Set(
          data
            .map((e) => e.role)
            .filter((r) => r && r !== "")
        ),
      ];

      setRoles(uniqueRoles);
    } catch (err) {
      console.error(err);
    }
  };

  // 🚀 LOAD DATA
  useEffect(() => {
    fetchEmployees();
  }, [search, filterRole]);

  useEffect(() => {
    fetchRoles();
  }, []);

  // ✏️ EDIT
  const editEmployee = (emp) => {
    setName(emp.name);
    setRole(emp.role);
    setSalary(emp.salary);
    setProjects(emp.projects);
    setEditId(emp.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ➕ ADD / UPDATE
  const addEmployee = async () => {
    if (!name || !role || !salary || !projects) {
      toast.error("Please fill all fields");
      return;
    }

    const token = getToken();

    const body = {
      name,
      role,
      salary,
      projects,
    };

    try {
      if (editId) {
        // ✏️ UPDATE
        await fetch(`http://localhost:5000/employees/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        toast.success("Employee Updated ✅");
        setEditId(null);
      } else {
        // ➕ ADD
        await fetch("http://localhost:5000/employees", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        toast.success("Employee Added ✅");
      }

      // 🧹 CLEAR FORM
      setName("");
      setRole("");
      setSalary("");
      setProjects("");

      fetchEmployees();
      fetchRoles();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  // ❌ DELETE
  const deleteEmployee = async (id) => {
    const token = getToken();

    try {
      await fetch(`http://localhost:5000/employees/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Employee Deleted ✅");

      fetchEmployees();
      fetchRoles();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // 🎨 ROLE COLORS
  const getRoleColor = (role) => {
    if (role.toLowerCase().includes("manager")) {
      return "bg-purple-100 text-purple-700";
    }

    if (role.toLowerCase().includes("developer")) {
      return "bg-blue-100 text-blue-700";
    }

    if (role.toLowerCase().includes("designer")) {
      return "bg-pink-100 text-pink-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ✅ SIDEBAR */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* ✅ CONTENT */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="p-6 pt-20">
          {/* 🔝 HEADER */}
          <div className="flex items-center gap-4 mb-6">
            {!isOpen && (
              <button
                onClick={() => setIsOpen(true)}
                className="bg-white p-2 rounded shadow"
              >
                ☰
              </button>
            )}

            <div>
              <h1 className="text-3xl font-bold">
                Employees
              </h1>

              <p className="text-gray-500">
                Manage employees and roles
              </p>
            </div>
          </div>

          {/* 📊 STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow">
              <p className="text-gray-500">Total Employees</p>

              <h2 className="text-3xl font-bold mt-2">
                {employees.length}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <p className="text-gray-500">Roles</p>

              <h2 className="text-3xl font-bold mt-2">
                {roles.length}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <p className="text-gray-500">Total Projects</p>

              <h2 className="text-3xl font-bold mt-2">
                {employees.reduce(
                  (total, emp) =>
                    total + Number(emp.projects || 0),
                  0
                )}
              </h2>
            </div>
          </div>

          {/* 🔍 SEARCH + FILTER */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              className="border p-3 rounded-xl w-full bg-white"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="border p-3 rounded-xl bg-white"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All Roles</option>

              {roles.map((r, i) => (
                <option key={i} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* ➕ FORM */}
          <div className="bg-white p-6 rounded-2xl shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editId
                ? "Update Employee"
                : "Add New Employee"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                className="border p-3 rounded-xl"
                placeholder="Employee Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="border p-3 rounded-xl"
                placeholder="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />

              <input
                className="border p-3 rounded-xl"
                placeholder="Salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />

              <input
                className="border p-3 rounded-xl"
                placeholder="Projects"
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={addEmployee}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
              >
                {editId ? "Update Employee" : "Add Employee"}
              </button>

              {editId && (
                <button
                  onClick={() => {
                    setEditId(null);
                    setName("");
                    setRole("");
                    setSalary("");
                    setProjects("");
                  }}
                  className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-xl"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* 📋 TABLE */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="text-xl font-semibold">
                Employees List
              </h2>
            </div>

            {employees.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                No Employees Found
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Salary</th>
                    <th className="p-4">Projects</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="p-4 font-medium">
                        {emp.name}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                            emp.role
                          )}`}
                        >
                          {emp.role}
                        </span>
                      </td>

                      <td className="p-4 font-semibold">
                        ₹ {emp.salary}
                      </td>

                      <td className="p-4">
                        {emp.projects}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => editEmployee(emp)}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg mr-3 hover:bg-blue-200"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteEmployee(emp.id)}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}