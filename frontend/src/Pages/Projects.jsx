import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";

const Projects = () => {
  const [isOpen, setIsOpen] = useState(true);

  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [budget, setBudget] = useState("");

  const [projects, setProjects] = useState([]);
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const fetchProjects = async () => {
    try {
      const res = await fetch("http://localhost:5000/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Failed to fetch projects");
        return;
      }

      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const addOrUpdate = async () => {
    if (!name || !status || !budget) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const body = {
        name,
        status,
        budget: Number(budget),
      };

      if (editId) {
        await fetch(`http://localhost:5000/projects/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        toast.success("Project Updated");
      } else {
        await fetch("http://localhost:5000/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        toast.success("Project Added");
      }

      setName("");
      setStatus("");
      setBudget("");
      setEditId(null);

      fetchProjects();
    } catch (err) {
      console.log(err);
      toast.error("Operation failed");
    }
  };

  const deleteProject = async (id) => {
    try {
      await fetch(`http://localhost:5000/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Project Deleted");

      fetchProjects();
    } catch (err) {
      console.log(err);
      toast.error("Delete failed");
    }
  };

  const editProject = (project) => {
    setName(project.name);
    setStatus(project.status);
    setBudget(project.budget);
    setEditId(project.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const getStatusColor = (status) => {
    if (status === "Completed") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Pending") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-blue-100 text-blue-700";
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

            <div>
              <h1 className="text-3xl font-bold">
                Projects
              </h1>

              <p className="text-gray-500">
                Manage company projects easily
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow">
              <p className="text-gray-500">
                Total Projects
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {projects.length}
              </h2>
            </div>
          </div>

          {(role === "admin" || role === "hr") && (
            <div className="bg-white p-6 rounded-2xl shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {editId
                  ? "Update Project"
                  : "Add New Project"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    Select Status
                  </option>

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Completed">
                    Completed
                  </option>
                </select>

                <input
                  type="number"
                  placeholder="Budget"
                  value={budget}
                  onChange={(e) =>
                    setBudget(e.target.value)
                  }
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={addOrUpdate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  {editId
                    ? "Update Project"
                    : "Add Project"}
                </button>

                {editId && (
                  <button
                    onClick={() => {
                      setEditId(null);
                      setName("");
                      setStatus("");
                      setBudget("");
                    }}
                    className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="text-xl font-semibold">
                Projects List
              </h2>
            </div>

            {projects.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                No Projects Added
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4">Project</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Budget</th>

                    {(role === "admin" ||
                      role === "hr") && (
                      <th className="p-4">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="p-4 font-medium">
                        {project.name}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                      </td>

                      <td className="p-4 font-semibold">
                        ₹ {project.budget}
                      </td>

                      {(role === "admin" ||
                        role === "hr") && (
                        <td className="p-4">
                          <button
                            onClick={() =>
                              editProject(project)
                            }
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg mr-3 hover:bg-blue-200"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteProject(
                                project.id
                              )
                            }
                            className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </td>
                      )}
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
};

export default Projects;