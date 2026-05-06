import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

const Projects = () => {
  const [isOpen, setIsOpen] = useState(true);

  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [budget, setBudget] = useState("");
  const [projects, setProjects] = useState([]);
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");

  // 🔐 FETCH
  const fetchProjects = async () => {
    try {
      const res = await fetch("http://localhost:5000/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        localStorage.removeItem("token");
        window.location.href = "/";
        return;
      }

      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ➕ ADD / UPDATE
  const addOrUpdate = async () => {
    const body = {
      name,
      status,
      budget: Number(budget),
    };

    try {
      if (editId) {
        await fetch(`http://localhost:5000/projects/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        setEditId(null);
      } else {
        await fetch("http://localhost:5000/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      }

      setName("");
      setStatus("");
      setBudget("");
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ DELETE
  const deleteProject = async (id) => {
    try {
      await fetch(`http://localhost:5000/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  // ✏️ EDIT
  const editProject = (p) => {
    setName(p.name);
    setStatus(p.status);
    setBudget(p.budget);
    setEditId(p.id);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* ✅ Sidebar */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* ✅ Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="p-6 pt-20">
          
          {/* Top bar */}
          <div className="flex items-center gap-4 mb-6">
            {!isOpen && (
              <button
                onClick={() => setIsOpen(true)}
                className="bg-white p-2 rounded shadow"
              >
                ☰
              </button>
            )}
            <h1 className="text-3xl font-bold">Projects</h1>
          </div>

          {/* FORM */}
          <div className="bg-white p-6 rounded-xl shadow mb-6">
            <div className="grid grid-cols-3 gap-3">
              <input
                className="p-3 border rounded-lg"
                placeholder="Project Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="p-3 border rounded-lg"
                placeholder="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />

              <input
                className="p-3 border rounded-lg"
                placeholder="Budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <button
              onClick={addOrUpdate}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              {editId ? "Update" : "Add"}
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-4">{p.name}</td>
                    <td className="p-4">{p.status}</td>
                    <td className="p-4">{p.budget}</td>
                    <td className="p-4">
                      <button
                        onClick={() => editProject(p)}
                        className="text-blue-600 mr-4"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteProject(p.id)}
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
};

export default Projects;