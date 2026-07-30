import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import {
  Search,
  FolderKanban,
  CircleDollarSign,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  FileSpreadsheet,
  FileText,
  Check,
  X,
} from "lucide-react";

const Projects = () => {
const [name,setName] = useState("");
const [status,setStatus] = useState("");
const [budget,setBudget] = useState("");
const [projects,setProjects] = useState([]);
const [editId,setEditId] = useState(null);
const [employees,setEmployees] = useState([]);
const [selectedEmployees,setSelectedEmployees] = useState({});
const [search,setSearch] = useState("");
const [filterStatus,setFilterStatus] = useState("All");
const [showForm,setShowForm] = useState(true);

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

// FETCH PROJECTS

const fetchProjects = async()=>{ try{
const res = await fetch("http://localhost:5000/projects",
{
headers:{Authorization:`Bearer ${token}`}
}
);
const data = await res.json();
setProjects(
Array.isArray(data)
? data
:[]
);
}
catch(err){ console.log(err);
toast.error("Failed to fetch projects");
}
};

// FETCH EMPLOYEES

const fetchEmployees = async()=>{
try{
const res = await fetch(
"http://localhost:5000/projects/project-employees",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

const data = await res.json();
setEmployees(
Array.isArray(data)
? data
:[]
);
}
catch(err){console.log(err);}
};

useEffect(()=>{fetchProjects();
if(role==="admin" || role==="hr"
){
fetchEmployees();
}
},[]);


// FILTER DATA


const filteredProjects = projects.filter((project)=>{
const searchMatch = project.name ?.toLowerCase() .includes(
search.toLowerCase()
);
const statusMatch = filterStatus==="All" || project.status===filterStatus;

return (
searchMatch &&
statusMatch
);
});
const totalProjects = projects.length;
const completedProjects = projects.filter(
  p=>p.status==="Completed").length;

const pendingProjects = projects.filter(
  p=>p.status==="Pending").length;

const activeProjects = projects.filter(
  p=>p.status==="In Progress").length;

// =========================
// ADD / UPDATE PROJECT
// =========================

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

      await fetch(
        `http://localhost:5000/projects/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      toast.success("Project Updated");

    } else {

      await fetch(
        "http://localhost:5000/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      toast.success("Project Added");
    }

    setName("");
    setStatus("");
    setBudget("");
    setEditId(null);

    fetchProjects();

  } catch (err) {

    console.log(err);

    toast.error("Operation Failed");
  }
};


// =========================
// ASSIGN PROJECT
// =========================

const assignProject = async (projectId) => {

  if (!selectedEmployees[projectId]) {

    toast.error("Select Employee");

    return;
  }

  try {

    await fetch(
      "http://localhost:5000/projects/assign-project",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({

          employee_code:
            selectedEmployees[projectId],

          project_id: projectId,

        }),

      }
    );

    toast.success("Project Assigned");

    setSelectedEmployees({
      ...selectedEmployees,
      [projectId]: "",
    });

    fetchProjects();

  } catch (err) {

    console.log(err);

    toast.error("Assignment Failed");

  }

};


// =========================
// SEND FOR APPROVAL
// =========================

const sendForApproval = async (id) => {

  try {

    await fetch(
      `http://localhost:5000/projects/${id}/send-approval`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("Sent For Approval");

    fetchProjects();

  } catch (err) {

    toast.error("Operation Failed");

  }

};


// =========================
// APPROVE PROJECT
// =========================

const approveProject = async (id) => {

  try {

    await fetch(
      `http://localhost:5000/projects/${id}/approve`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("Project Approved");

    fetchProjects();

  } catch (err) {

    toast.error("Approval Failed");

  }

};


// =========================
// REJECT PROJECT
// =========================

const rejectProject = async (id) => {

  try {

    await fetch(
      `http://localhost:5000/projects/${id}/reject`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("Project Rejected");

    fetchProjects();

  } catch (err) {

    toast.error("Reject Failed");

  }

};
// =========================
// DELETE PROJECT
// =========================

const deleteProject = async (id) => {

  try {

    await fetch(
      `http://localhost:5000/projects/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("Project Deleted");

    fetchProjects();

  } catch (err) {

    console.log(err);

    toast.error("Delete Failed");

  }

};

const downloadPDF = () => {
  window.open(
    "http://localhost:5000/projects/pdf",
    "_blank"
  );
};

const downloadExcel = () => {
  window.open(
    "http://localhost:5000/projects/excel",
    "_blank"
  );
};


// =========================
// EDIT PROJECT
// =========================

const editProject = (project) => {

  setName(project.name);
  setStatus(project.status);
  setBudget(project.budget);
  setEditId(project.id);

  setShowForm(true);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

};


// =========================
// STATUS COLORS
// =========================

const getStatusColor = (status) => {

  switch (status) {

    case "Completed":
      return "bg-green-100 text-green-700";

    case "Pending":
      return "bg-yellow-100 text-yellow-700";

    case "In Progress":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-gray-100 text-gray-700";
  }

};



// =========================
// RETURN
// =========================

return (

<div className="min-h-screen bg-gray-100 p-6">

{/* HEADER */}

<div className="flex justify-between items-center mb-8">

<div>

<h1 className="text-3xl font-bold text-gray-800">

Project Management

</h1>

<p className="text-gray-500 mt-1">

Manage, assign and monitor company projects

</p>

</div>

<div className="flex gap-3">

  <button
    onClick={downloadPDF}
    className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl flex items-center gap-2"
  >
    <FileText size={18} />
    PDF
  </button>

  <button
    onClick={downloadExcel}
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl flex items-center gap-2"
  >
    <FileSpreadsheet size={18} />
    Excel
  </button>

  {(role === "admin" || role === "hr") && (
    <button
      onClick={() => setShowForm(!showForm)}
      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2"
    >
      <Plus size={18} />
      New Project
    </button>
  )}

</div>

</div> {/* <-- closes the HEADER div */}



{/* SEARCH */}

<div className="bg-white rounded-2xl shadow p-5 mb-6">

<div className="grid md:grid-cols-2 gap-4">

<div className="relative">

<Search
size={18}
className="absolute left-3 top-3.5 text-gray-400"
/>

<input

type="text"

placeholder="Search Projects..."

value={search}

onChange={(e)=>setSearch(e.target.value)}

className="w-full pl-10 pr-4 py-3 border rounded-xl"

 />

</div>

<select

value={filterStatus}

onChange={(e)=>setFilterStatus(e.target.value)}

className="border rounded-xl px-4 py-3"

>

<option>All</option>

<option>Pending</option>

<option>In Progress</option>

<option>Completed</option>

</select>

</div>

</div>



{/* DASHBOARD CARDS */}

<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

<div className="bg-white rounded-2xl shadow p-6">

<div className="flex justify-between">

<div>

<p className="text-gray-500">

Total Projects

</p>

<h2 className="text-3xl font-bold mt-2">

{totalProjects}

</h2>

</div>

<div className="bg-blue-100 p-3 rounded-xl">

<FolderKanban
size={26}
className="text-blue-600"
/>

</div>

</div>

</div>

<div className="bg-white rounded-2xl shadow p-6">

<div className="flex justify-between">

<div>

<p className="text-gray-500">

Completed

</p>

<h2 className="text-3xl font-bold mt-2 text-green-600">

{completedProjects}

</h2>

</div>

<div className="bg-green-100 p-3 rounded-xl">

<CheckCircle
size={26}
className="text-green-600"
/>

</div>

</div>

</div>

<div className="bg-white rounded-2xl shadow p-6">

<div className="flex justify-between">

<div>

<p className="text-gray-500">

In Progress

</p>

<h2 className="text-3xl font-bold mt-2 text-blue-600">

{activeProjects}

</h2>

</div>

<div className="bg-blue-100 p-3 rounded-xl">

<Clock
size={26}
className="text-blue-600"
/>

</div>

</div>

</div>

<div className="bg-white rounded-2xl shadow p-6">

<div className="flex justify-between">

<div>

<p className="text-gray-500">

Total Budget

</p>

<h2 className="text-3xl font-bold mt-2 text-purple-600">

₹ {projects.reduce((sum,p)=>sum+Number(p.budget),0).toLocaleString()}

</h2>

</div>

<div className="bg-purple-100 p-3 rounded-xl">

<CircleDollarSign
size={26}
className="text-purple-600"
/>

</div>

</div>

</div>

</div>
{/* ADD / UPDATE PROJECT */}

{(role === "admin" || role === "hr") && showForm && (

<div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

<div className="flex justify-between items-center mb-6">

<h2 className="text-2xl font-bold">

{editId ? "Update Project" : "Create New Project"}

</h2>

</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-5">

<input
type="text"
placeholder="Project Name"
value={name}
onChange={(e)=>setName(e.target.value)}
className="border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
/>

<select
value={status}
onChange={(e)=>setStatus(e.target.value)}
className="border rounded-xl px-4 py-3"
>

<option value="">Select Status</option>
<option value="Pending">Pending</option>
<option value="In Progress">In Progress</option>
<option value="Completed">Completed</option>

</select>

<input
type="number"
placeholder="Budget"
value={budget}
onChange={(e)=>setBudget(e.target.value)}
className="border rounded-xl px-4 py-3"
/>

</div>

<div className="mt-6 flex gap-4">

<button
onClick={addOrUpdate}
className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
>

{editId ? "Update Project" : "Add Project"}

</button>

{editId && (

<button
onClick={()=>{
setEditId(null);
setName("");
setStatus("");
setBudget("");
}}
className="bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-xl"
>

Cancel

</button>

)}

</div>

</div>

)}

{/* PROJECT TABLE */}

<div className="bg-white rounded-2xl shadow-lg overflow-hidden">

<div className="p-6 border-b">

<h2 className="text-2xl font-bold">

Projects List

</h2>

</div>

<div className="overflow-x-auto">

<table className="min-w-full">

<thead className="bg-gray-50">

<tr>

<th className="px-6 py-4 text-left">Project</th>

<th className="px-6 py-4 text-left">Status</th>

<th className="px-6 py-4 text-left">Budget</th>

<th className="px-6 py-4 text-left">Assigned To</th>

<th className="px-6 py-4 text-left">Approval</th>

{(role==="admin" || role==="hr") && (

<th className="px-6 py-4 text-left">

Assign Employee

</th>

)}

<th className="px-6 py-4 text-center">

Actions

</th>

</tr>

</thead>

<tbody>

{filteredProjects.length===0 ? (

<tr>

<td
colSpan="7"
className="text-center py-12 text-gray-500"
>

No Projects Found

</td>

</tr>

) : (

filteredProjects.map((project)=>(

<tr
key={project.id}
className="border-t hover:bg-gray-50 transition"
>

<td className="px-6 py-5 font-semibold">

{project.name}

</td>

<td className="px-6 py-5">

<span
className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}
>

{project.status}

</span>

</td>

<td className="px-6 py-5 font-semibold">

₹ {Number(project.budget).toLocaleString()}

</td>

<td className="px-6 py-5">

{project.assigned_employee || "Not Assigned"}

</td>

<td className="px-6 py-5">

<span
className={`px-3 py-1 rounded-full text-sm font-medium

${project.approval_status==="Approved"
?"bg-green-100 text-green-700"

:project.approval_status==="Rejected"

?"bg-red-100 text-red-700"

:project.approval_status==="Pending Approval"

?"bg-yellow-100 text-yellow-700"

:"bg-blue-100 text-blue-700"

}`}

>

{project.approval_status || "In Progress"}

</span>

</td>

{(role === "admin" || role === "hr") && (

<td className="px-6 py-5">

<div className="flex gap-2">

<select
value={selectedEmployees[project.id] || ""}
onChange={(e)=>
setSelectedEmployees({
...selectedEmployees,
[project.id]:e.target.value
})
}
className="border rounded-lg px-3 py-2"
>

<option value="">
Select
</option>

{employees.map((emp)=>(
<option
key={emp.employee_code}
value={emp.employee_code}
>
{emp.name}
</option>
))}

</select>

<button
onClick={()=>assignProject(project.id)}
className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
>

<UserPlus size={18}/>

</button>

</div>

</td>

)}

<td className="px-6 py-5">

<div className="flex flex-wrap gap-2 justify-center">

{(role==="admin" || role==="hr") && (

<>

<button
onClick={()=>editProject(project)}
className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg"
>

<Edit size={18}/>

</button>

<button
onClick={()=>deleteProject(project.id)}
className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg"
>

<Trash2 size={18}/>

</button>

{project.approval_status==="Pending Approval" && (

<>

<button
onClick={()=>approveProject(project.id)}
className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
>

<Check size={18}/>

</button>

<button
onClick={()=>rejectProject(project.id)}
className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg"
>

<X size={18}/>

</button>

</>

)}

</>

)}

{role==="employee" && (

<button
onClick={()=>sendForApproval(project.id)}
className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
>

Send For Approval

</button>

)}

</div>

</td>

</tr>

))

)}

</tbody>

</table>

</div>

</div>

</div>

);

};

export default Projects;