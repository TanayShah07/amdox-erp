import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

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
<<<<<<< HEAD

  const fetchEmployees = async () => {
    const token = localStorage.getItem("token");

=======

  const navigate = useNavigate();

  // 🔐 Always get fresh token (important)
  const getToken = () => localStorage.getItem("token");

  // 🔐 FETCH EMPLOYEES
  const fetchEmployees = async () => {
    const token = getToken();

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/employees?search=${search}&role=${filterRole}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ❗ handle unauthorized
      if (!res.ok) {
        console.log("Unauthorized - redirecting");
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ➕ ADD / UPDATE
  const addOrUpdateEmployee = async () => {
    const token = getToken();

    if (!token) {
      navigate("/");
      return;
    }

    const body = {
      name,
      role,
      salary: Number(salary),
      projects: Number(projects),
    };

    try {
      if (editId) {
        await fetch(`http://localhost:5000/employees/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        setEditId(null);
      } else {
        await fetch("http://localhost:5000/employees", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      }

      // reset form
      setName("");
      setRole("");
      setSalary("");
      setProjects("");

      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ DELETE
  const deleteEmployee = async (id) => {
    const token = getToken();

>>>>>>> 5c33efc5fb15bba6ec1ff854a0157bbe6ec31db7
    if (!token) {
      navigate("/");
      return;
    }

<<<<<<< HEAD
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

  const fetchRoles = async () => {
    const token = localStorage.getItem("token");

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

  const addEmployee = async () => {
    const token = localStorage.getItem("token");

    await fetch("http://localhost:5000/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, role, salary, projects }),
    });

    setName("");
    setRole("");
    setSalary("");
    setProjects("");

    fetchEmployees();
    fetchRoles();
  };

  const deleteEmployee = async (id) => {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5000/employees/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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
=======
    try {
      await fetch(`http://localhost:5000/employees/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  // ✏️ EDIT
  const editEmployee = (emp) => {
    setName(emp.name);
    setRole(emp.role);
    setSalary(emp.salary);
    setProjects(emp.projects);
    setEditId(emp.id);
  };

  // 🔐 INITIAL LOAD + FILTER
  useEffect(() => {
    fetchEmployees();
  }, [search, filterRole]);

  // 🚪 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-64 bg-gray-900 text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8">ERP</h2>

        <button
          onClick={() => navigate("/dashboard")}
          className="mb-3 text-left px-3 py-2 rounded hover:bg-gray-700"
        >
          Dashboard
        </button>

        <button className="mb-3 text-left px-3 py-2 rounded bg-gray-700">
          Employees
        </button>

        <button
          onClick={handleLogout}
          className="mt-auto text-left px-3 py-2 rounded text-red-400 hover:bg-gray-700"
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Employees</h1>

        {/* SEARCH + FILTER */}
        <div className="flex gap-4 mb-4">
          <input
            className="p-3 border rounded-lg w-1/2"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="p-3 border rounded-lg"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="Manager">Manager</option>
            <option value="Developer">Developer</option>
          </select>
        </div>

        {/* FORM */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <div className="grid grid-cols-4 gap-3">
            <input
              className="p-3 border rounded-lg"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="p-3 border rounded-lg"
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />

            <input
              className="p-3 border rounded-lg"
              placeholder="Salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />

            <input
              className="p-3 border rounded-lg"
              placeholder="Projects"
              value={projects}
              onChange={(e) => setProjects(e.target.value)}
            />
>>>>>>> 5c33efc5fb15bba6ec1ff854a0157bbe6ec31db7
          </div>

          <div className="flex gap-4 mb-6">
            <input
              className="border p-3 rounded-lg w-80"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

<<<<<<< HEAD
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
                Add
              </button>
            </div>
          </div>

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
                      <button className="text-blue-500 mr-3">Edit</button>
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
=======
        {/* TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-200">
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
                <tr key={emp.id} className="border-t">
                  <td className="p-4">{emp.name}</td>
                  <td className="p-4">{emp.role}</td>
                  <td className="p-4">{emp.salary}</td>
                  <td className="p-4">{emp.projects}</td>
                  <td className="p-4">
                    <button
                      onClick={() => editEmployee(emp)}
                      className="text-blue-600 mr-4"
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

          {employees.length === 0 && (
            <p className="text-center p-4 text-gray-500">
              No employees found
            </p>
          )}
>>>>>>> 5c33efc5fb15bba6ec1ff854a0157bbe6ec31db7
        </div>
      </div>
    </div>
  );
}