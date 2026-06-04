import { useState, useEffect } from "react";
import toast from "react-hot-toast";
const Projects = () => {
  
  const [name, setName] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [budget, setBudget] =
    useState("");

  const [projects, setProjects] =
    useState([]);

  const [editId, setEditId] =
    useState(null);

  const [employees, setEmployees] =
    useState([]);

  const [selectedEmployees,
    setSelectedEmployees] =
    useState({});

  const token =
    localStorage.getItem("token");

  const role =
    localStorage.getItem("role");

  const fetchProjects = async () => {
    try {

      let url =
        "http://localhost:5000/projects";

      if (role === "employee") {

        const profileRes =
          await fetch(
"http://localhost:5000/api/user/profile",           {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const profileData =
          await profileRes.json();

        const employeeCode =
          profileData.user.employee_code;

        url =
          `http://localhost:5000/projects?employee_code=${employeeCode}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data =
        await res.json();

      setProjects(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.log(err);

      toast.error(
        "Failed to fetch projects"
      );

    }
  };

  const fetchEmployees =
    async () => {

      try {

        const res = await fetch(
          "http://localhost:5000/project-employees",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data =
          await res.json();

        setEmployees(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.log(err);

      }
    };

  useEffect(() => {

    fetchProjects();

    if (
      role === "admin" ||
      role === "hr"
    ) {
      fetchEmployees();
    }

  }, []);

  const addOrUpdate = async () => {

    if (
      !name ||
      !status ||
      !budget
    ) {
      toast.error(
        "Please fill all fields"
      );
      return;
    }

    try {

      const body = {
        name,
        status,
        budget:
          Number(budget),
      };

      if (editId) {

        await fetch(
          `http://localhost:5000/projects/${editId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(body),
          }
        );

        toast.success(
          "Project Updated"
        );

      } else {

        await fetch(
          "http://localhost:5000/projects",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(body),
          }
        );

        toast.success(
          "Project Added"
        );
      }

      setName("");
      setStatus("");
      setBudget("");
      setEditId(null);

      fetchProjects();

    } catch (err) {

      console.log(err);

      toast.error(
        "Operation failed"
      );

    }
  };

  const assignProject =
    async (projectId) => {

      if (
        !selectedEmployees[
          projectId
        ]
      ) {
        toast.error(
          "Select employee"
        );
        return;
      }

      try {

        await fetch(
          "http://localhost:5000/assign-project",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              employee_code:
                selectedEmployees[
                  projectId
                ],

              project_id:
                projectId,
            }),
          }
        );

        toast.success(
          "Project Assigned"
        );

        setSelectedEmployees({
          ...selectedEmployees,
          [projectId]: "",
        });

        fetchProjects();

      } catch (err) {

        console.log(err);

        toast.error(
          "Assignment failed"
        );

      }
    };

  const sendForApproval =
    async (id) => {

      try {

        await fetch(
          `http://localhost:5000/projects/${id}/send-approval`,
          {
            method: "PUT",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        toast.success(
          "Sent For Approval"
        );

        fetchProjects();

      } catch (err) {

        console.log(err);

        toast.error(
          "Operation failed"
        );

      }
    };

  const approveProject =
    async (id) => {

      try {

        await fetch(
          `http://localhost:5000/projects/${id}/approve`,
          {
            method: "PUT",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        toast.success(
          "Project Approved"
        );

        fetchProjects();

      } catch (err) {

        console.log(err);

        toast.error(
          "Approval failed"
        );

      }
    };

  const rejectProject =
    async (id) => {

      try {

        await fetch(
          `http://localhost:5000/projects/${id}/reject`,
          {
            method: "PUT",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        toast.success(
          "Project Rejected"
        );

        fetchProjects();

      } catch (err) {

        console.log(err);

        toast.error(
          "Reject failed"
        );

      }
    };

  const deleteProject =
    async (id) => {

      try {

        await fetch(
          `http://localhost:5000/projects/${id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        toast.success(
          "Project Deleted"
        );

        fetchProjects();

      } catch (err) {

        console.log(err);

        toast.error(
          "Delete failed"
        );

      }
    };

  const editProject =
    (project) => {

      setName(project.name);
      setStatus(project.status);
      setBudget(project.budget);
      setEditId(project.id);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  const getStatusColor =
    (status) => {

      if (
        status === "Completed"
      ) {
        return "bg-green-100 text-green-700";
      }

      if (
        status === "Pending"
      ) {
        return "bg-yellow-100 text-yellow-700";
      }

      return "bg-blue-100 text-blue-700";
    };

  return (
  <div className="flex min-h-screen bg-gray-100">
    

    <div className="flex-1">
      <div className="w-full">
        <div className="p-6 pt-20">

          <div className="flex items-center gap-4 mb-6">

          
            

            <div>

              <h1 className="text-3xl font-bold">
                Projects
              </h1>

              <p className="text-gray-500">
                Manage company projects easily
              </p>

            </div>

          </div>

          {(role === "admin" ||
            role === "hr") && (

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
                    setName(
                      e.target.value
                    )
                  }
                  className="p-3 border rounded-lg"
                />

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value
                    )
                  }
                  className="p-3 border rounded-lg"
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
                    setBudget(
                      e.target.value
                    )
                  }
                  className="p-3 border rounded-lg"
                />

              </div>

              <div className="flex gap-3 mt-4">

                <button
                  onClick={addOrUpdate}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                >

                  {editId
                    ? "Update Project"
                    : "Add Project"}

                </button>

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

                    <th className="p-4">
                      Project
                    </th>

                    <th className="p-4">
                      Status
                    </th>

                    <th className="p-4">
                      Budget
                    </th>

                    <th className="p-4">
                      Assigned To
                    </th>

                    <th className="p-4">
                      Approval Status
                    </th>

                    {(role === "admin" ||
                      role === "hr") && (
                      <th className="p-4">
                        Assign Employee
                      </th>
                    )}

                    <th className="p-4">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {projects.map(
                    (project) => (

                    <tr
                      key={project.id}
                      className="border-t hover:bg-gray-50"
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

                      <td className="p-4">
                        {project.assigned_employee ||
                          "Not Assigned"}
                      </td>

                      <td className="p-4">

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            project.approval_status ===
                            "Approved"
                              ? "bg-green-100 text-green-700"
                              : project.approval_status ===
                                "Rejected"
                              ? "bg-red-100 text-red-700"
                              : project.approval_status ===
                                "Pending Approval"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {project.approval_status ||
                            "In Progress"}
                        </span>

                      </td>

                      {(role === "admin" ||
                        role === "hr") && (

                        <td className="p-4">

                          <div className="flex gap-2">

                            <select
                              value={
                                selectedEmployees[
                                  project.id
                                ] || ""
                              }

                              onChange={(e) =>
                                setSelectedEmployees({
                                  ...selectedEmployees,

                                  [project.id]:
                                    e.target.value,
                                })
                              }

                              className="border p-2 rounded"
                            >

                              <option value="">
                                Select
                              </option>

                              {employees.map(
                                (emp) => (

                                <option
                                  key={
                                    emp.employee_code
                                  }

                                  value={
                                    emp.employee_code
                                  }
                                >
                                  {emp.name}
                                </option>

                              ))}

                            </select>

                            <button
                              onClick={() =>
                                assignProject(
                                  project.id
                                )
                              }
                              className="bg-green-600 text-white px-3 py-1 rounded"
                            >
                              Assign
                            </button>

                          </div>

                        </td>
                      )}

                      <td className="p-4">

                        {(role === "admin" ||
                          role === "hr") && (
                          <>

                            <button
                              onClick={() =>
                                editProject(
                                  project
                                )
                              }
                              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg mr-3"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                deleteProject(
                                  project.id
                                )
                              }
                              className="bg-red-100 text-red-700 px-3 py-1 rounded-lg mr-3"
                            >
                              Delete
                            </button>

                            {project.approval_status ===
                              "Pending Approval" && (
                              <>

                                <button
                                  onClick={() =>
                                    approveProject(
                                      project.id
                                    )
                                  }
                                  className="bg-green-600 text-white px-3 py-1 rounded-lg mr-3"
                                >
                                  Approve
                                </button>

                                <button
                                  onClick={() =>
                                    rejectProject(
                                      project.id
                                    )
                                  }
                                  className="bg-yellow-600 text-white px-3 py-1 rounded-lg"
                                >
                                  Reject
                                </button>

                              </>
                            )}

                          </>
                        )}

                        {role === "employee" && (
                          <button
                            onClick={() =>
                              sendForApproval(
                                project.id
                              )
                            }
                            className="bg-purple-600 text-white px-3 py-1 rounded-lg"
                          >
                            Send For Approval
                          </button>
                        )}

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

    </div>
  );
};

export default Projects;