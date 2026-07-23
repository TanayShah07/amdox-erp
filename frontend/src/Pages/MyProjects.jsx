import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  Search,
  FolderKanban,
  CheckCircle,
  Clock,
  XCircle,
  Send
} from "lucide-react";

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [search,setSearch] = useState("");
  const [statusFilter,setStatusFilter] = useState("All");
  const [approvalFilter,setApprovalFilter] = useState("All");

  const employeeName = localStorage.getItem("name");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/my-projects/${employeeName}`
      );

      const data = await res.json();

      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load projects");
    }
  };

  const sendForApproval = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/projects/${id}/send-approval`,
        {
          method: "PUT",
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Sent For Approval");
        fetchProjects();
      } else {
        toast.error("Failed");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed");
    }
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

  const getApprovalColor = (status) => {
    if (status === "Approved") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Rejected") {
      return "bg-red-100 text-red-700";
    }

    if (status === "Pending Approval") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-blue-100 text-blue-700";
  };

  const filteredProjects = projects.filter((project)=>{

const searchMatch =
project.name
.toLowerCase()
.includes(search.toLowerCase());


const statusMatch =
statusFilter==="All" ||
project.status===statusFilter;


const approvalMatch =
approvalFilter==="All" ||
project.approval_status===approvalFilter;


return (
searchMatch &&
statusMatch &&
approvalMatch
);

});

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          My Projects
        </h1>

        <p className="text-gray-500 mt-2">
          View and manage your assigned projects
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500">
            Assigned Projects
          </p>

          <p className="text-3xl font-bold">
            {projects.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500">
            Approved
          </p>

          <p className="text-3xl font-bold text-green-600">
            {
              projects.filter(
                (p) =>
                  p.approval_status ===
                  "Approved"
              ).length
            }
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500">
            Pending Approval
          </p>

          <p className="text-3xl font-bold text-yellow-600">
            {
              projects.filter(
                (p) =>
                  p.approval_status ===
                  "Pending Approval"
              ).length
            }
          </p>
        </div>
      </div>


      <div className="bg-white p-6 rounded-2xl shadow">
        <p className="text-gray-500">
          Rejected
        </p>
        <p className="text-3xl font-bold text-red-600">
          {
          projects.filter(
            (p)=>p.approval_status==="Rejected"
            ).length
          }
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
            />
            <input
            placeholder="Search Project..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            className="w-full border rounded-xl p-3 pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e)=>setStatusFilter(e.target.value)}
            className="border rounded-xl p-3"
            >
              <option>All</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
          </select>
          <select
              value={approvalFilter}
              onChange={(e)=>setApprovalFilter(e.target.value)}
              className="border rounded-xl p-3"
              >
                <option>All</option>
                <option>Approved</option>
                <option>Pending Approval</option>
                <option>Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        {filteredProjects.length === 0 ? (
          <div className="p-10 text-center text-gray-500"> 
          No Projects Assigned
          </div>
          ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-gray-600">
                  Project
                </th>
                <th className="px-6 py-4 text-left text-gray-600">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-gray-600">
                  Budget
                </th>
                <th className="px-6 py-4 text-left text-gray-600">
                  Approval Status
                </th>
                <th className="px-6 py-4 text-left text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
          <tbody>
            {filteredProjects.map((project) => (
              <tr
              key={project.id}className="border-t hover:bg-gray-50 transition-all duration-200"
              >
                <td className="p-5 font-medium">
                  {project.name}
                </td>
                <td className="p-5">
                 <span
                   className={`${getStatusColor(project.status)} px-4 py-2 rounded-full text-sm font-semibold`}
                   >
                   {project.status}
                 </span>
                </td>
                <td className="p-5 font-semibold text-gray-700">
                   ₹{" "}{Number(project.budget).toLocaleString("en-IN")}
                </td>
                <td className="p-5">
                  <span
                    className={`${getApprovalColor(
                    project.approval_status
                    )} px-4 py-2 rounded-full text-sm font-semibold`}
                    >
                    {project.approval_status}
                  </span>
                </td>
                <td className="p-5">
                  {project.approval_status !==
                  "Approved" &&
                   project.approval_status !==
                   "Pending Approval" && (
                    <button
                      onClick={() =>
                      sendForApproval(project.id)
                      }
                      className="bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700"
                      >
                      <Send size={16} className="inline mr-2"/>
                      Send
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
  );
}