import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Employees = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [projects, setProjects] = useState("");
  const [employees, setEmployees] = useState([]);
  const [editId, setEditId] = useState(null);

  const navigate = useNavigate();

  const fetchEmployees = async () => {
    const res = await fetch("http://localhost:5000/employees");
    const data = await res.json();
    setEmployees(data);
  };

  const addOrUpdateEmployee = async () => {
    const body = {
      name,
      role,
      salary: Number(salary),
      projects: Number(projects),
    };

    if (editId) {
      await fetch(`http://localhost:5000/employees/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setEditId(null);
    } else {
      await fetch("http://localhost:5000/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    setName("");
    setRole("");
    setSalary("");
    setProjects("");
    fetchEmployees();
  };

  const deleteEmployee = async (id) => {
    await fetch(`http://localhost:5000/employees/${id}`, {
      method: "DELETE",
    });
    fetchEmployees();
  };

  const editEmployee = (emp) => {
    setName(emp.name);
    setRole(emp.role);
    setSalary(emp.salary);
    setProjects(emp.projects);
    setEditId(emp.id);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
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
          onClick={() => navigate("/")}
          className="mt-auto text-left px-3 py-2 rounded text-red-400 hover:bg-gray-700"
        >
          Logout
        </button>
      </div>

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Employees</h1>

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
          </div>

          <button
            onClick={addOrUpdateEmployee}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            {editId ? "Update" : "Add"}
          </button>
        </div>

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
        </div>
      </div>
    </div>
  );
};

export default Employees;