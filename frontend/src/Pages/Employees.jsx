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

    if (res.status === 401) {
      localStorage.removeItem("token");
      navigate("/");
      return;
    }

    const data = await res.json();
    setEmployees(Array.isArray(data) ? data : []);
  };

  // 🔐 FETCH ROLES
  const fetchRoles = async () => {
    const token = getToken();

    const res = await fetch("http://localhost:5000/employees", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    const uniqueRoles = [
      ...new Set(data.map((e) => e.role).filter((r) => r && r !== "")),
    ];

    setRoles(uniqueRoles);
  };

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
  };

  // ➕ ADD / UPDATE
  const addEmployee = async () => {
    if (!name || !role || !salary || !projects) {
      toast.error("Please fill all fields");
      return;
    }

    const token = getToken();

    try {
      if (editId) {
        // UPDATE
        await fetch(`http://localhost:5000/employees/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, role, salary, projects }),
        });

        toast.success("Employee Updated ✅");
        setEditId(null);
      } else {
        // ADD
        await fetch("http://localhost:5000/employees", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, role, salary, projects }),
        });

        toast.success("Employee Added ✅");
      }

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

    await fetch(`http://localhost:5000/employees/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success("Employee Deleted ✅");

    fetchEmployees();
    fetchRoles();
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
            <h1 className="text-3xl font-bold">Employees</h1>
          </div>

          {/* 🔍 SEARCH + FILTER */}
          <div className="flex gap-4 mb-6">
            <input
              className="border p-3 rounded-lg w-80"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="border p-3 rounded-lg"
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
          <div className="bg-white p-6 rounded-xl shadow mb-6">
            <div className="flex gap-4">
              <input
                className="border p-3 rounded-lg w-full"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="border p-3 rounded-lg w-full"
                placeholder="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />

              <input
                className="border p-3 rounded-lg w-full"
                placeholder="Salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />

              <input
                className="border p-3 rounded-lg w-full"
                placeholder="Projects"
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
              />

              <button
                onClick={addEmployee}
                className="bg-blue-600 text-white px-6 rounded-lg"
              >
                {editId ? "Update" : "Add"}
              </button>
            </div>
          </div>

          {/* 📋 TABLE */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">Salary</th>
                  <th className="p-4 text-left">Projects</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-t">
                    <td className="p-4">{emp.name}</td>
                    <td className="p-4">{emp.role}</td>
                    <td className="p-4">{emp.salary}</td>
                    <td className="p-4">{emp.projects}</td>
                    <td className="p-4">
                      <button
                        onClick={() => editEmployee(emp)}
                        className="text-blue-500 mr-3"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteEmployee(emp.id)}
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}