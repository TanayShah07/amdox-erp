import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Employees() {
  const userRole = localStorage.getItem("role");

  const [employees, setEmployees] = useState([]);

  const [roles, setRoles] = useState([]);
  const [employeeCode, setEmployeeCode] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [projects, setProjects] = useState("");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchEmployees = async () => {
  try {
    const res = await fetch(
      "http://localhost:5000/employees"
    );

    const data = await res.json();

    setEmployees(
      Array.isArray(data) ? data : []
    );
  } catch (err) {
    console.log(err);
    toast.error("Failed to fetch employees");
  }
};

  useEffect(() => {
  fetchEmployees();
}, []);

useEffect(() => {
  const uniqueRoles = [
    ...new Set(employees.map((e) => e.role)),
  ];

  setRoles(uniqueRoles);
}, [employees]);

  // ================= EXCEL EXPORT =================
  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Employees");

    sheet.columns = [
      { header: "Employee ID", key: "employee_code", width: 15 },
      { header: "Name", key: "name", width: 20 },
      { header: "Role", key: "role", width: 15 },
      { header: "Salary", key: "salary", width: 15 },
      { header: "Projects", key: "projects", width: 15 },
    ];

    employees.forEach((emp) => sheet.addRow(emp));

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.xlsx";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  // ================= PDF EXPORT =================
  const exportPDF = () => {
    const doc = new jsPDF();

    const columns = ["Employee ID", "Name", "Role", "Salary", "Projects"];

    const rows = employees.map((emp) => [
      emp.employee_code,
      emp.name,
      emp.role,
      emp.salary,
      emp.projects,
    ]);

    doc.text("Employees Report", 14, 10);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
    });

    doc.save("employees.pdf");
  };

  // ================= FILTER =================
  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(search.toLowerCase());

    const matchRole = !filterRole || emp.role === filterRole;

    return matchSearch && matchRole;
  });

  // ================= ADD / UPDATE =================
  const addEmployee = async () => {
  if (
    !employeeCode ||
    !name ||
    !role ||
    !salary
  ) {
    toast.error("Please fill all fields");
    return;
  }

  try {
    let res;

    if (editId) {
      res = await fetch(
        `http://localhost:5000/employees/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            employee_code: employeeCode,
            name,
            role,
            salary,
            projects: 0,
          }),
        }
      );
    } else {
      res = await fetch(
        "http://localhost:5000/employees",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            employee_code: employeeCode,
            name,
            role,
            salary,
            projects: 0,
          }),
        }
      );
    }

    const data = await res.json();

    if (data.success) {
      toast.success(
        editId
          ? "Employee Updated"
          : "Employee Added"
      );

      setEmployeeCode("");
      setName("");
      setRole("");
      setSalary("");
      setProjects("");
      setEditId(null);

      fetchEmployees();
    }
  } catch (err) {
    console.log(err);
    toast.error("Operation Failed");
  }
};
  // ================= DELETE =================
  const deleteEmployee = async (id) => {
  try {
    const res = await fetch(
      `http://localhost:5000/employees/${id}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

    if (data.success) {
      toast.success(
        "Employee Deleted"
      );

      fetchEmployees();
    }
  } catch (err) {
    console.log(err);
    toast.error(
      "Delete Failed"
    );
  }
};

  // ================= ROLE COLOR =================
  const getRoleColor = (role) => {
    if (role?.toLowerCase().includes("manager"))
      return "bg-purple-100 text-purple-700";
    if (role?.toLowerCase().includes("developer"))
      return "bg-blue-100 text-blue-700";
    if (role?.toLowerCase().includes("hr"))
      return "bg-gray-100 text-gray-700";

    return "bg-green-100 text-green-700";
  };

  return (
   <div className="bg-gray-100 min-h-screen">
  <div className="p-8">

        {/* HEADER */}
        <h1 className="text-5xl font-bold text-gray-800 mb-8">
          Employees
        </h1>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">Total Employees</p>
            <p className="text-3xl font-bold">{employees.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">Roles</p>
            <p className="text-3xl font-bold">{roles.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">Active Projects</p>
            <p className="text-3xl font-bold">
              {employees.reduce((a, b) => a + Number(b.projects || 0), 0)}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="flex gap-4 mb-6">
          <input
            className="border p-3 rounded-xl w-full"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border p-3 rounded-xl"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">All Roles</option>
            {roles.map((r, i) => (
              <option key={i}>{r}</option>
            ))}
          </select>
        </div>

        {/* EXPORT BUTTONS */}
        <div className="flex gap-4 mb-5">
          <button
            onClick={exportPDF}
            className="bg-red-500 text-white px-5 py-3 rounded-lg"
          >
            Export PDF
          </button>

          <button
            onClick={exportExcel}
            className="bg-green-500 text-white px-5 py-3 rounded-lg"
          >
            Export Excel
          </button>
        </div>

        {/* FORM */}
        {(userRole === "admin" || userRole === "hr") && (
          <div className="bg-white p-6 rounded-2xl shadow mb-8">
            <div className="grid grid-cols-5 gap-4">
              <input
                placeholder="ID"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
              />
              <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                placeholder="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <input
                placeholder="Salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
              <input
                placeholder="Projects"
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
              />
            </div>

            <button
              onClick={addEmployee}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl mt-4"
            >
              {editId ? "Update" : "Add Employee"}
            </button>
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-5 text-left">Employee Code</th>
                <th className="p-5 text-left">Employee Name</th>
                <th className="p-5 text-left">Role</th>
                <th className="p-5 text-left">Salary</th>
                <th className="p-5 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
            {filteredEmployees.map((emp) => (
              <tr
                key={emp.id}
                className="border-t hover:bg-gray-50 transition-all duration-200"
              >
                <td className="p-5 font-medium">
                  {emp.employee_code}
                </td>

                <td className="p-5">
                  {emp.name}
                </td>

                <td className="p-5">
                  <span
                    className={`${getRoleColor(
                      emp.role
                    )} px-4 py-2 rounded-full text-sm font-semibold`}
                  >
                    {emp.role}
                  </span>
                </td>

                <td className="p-5 font-semibold text-gray-700">
                  ₹ {Number(emp.salary).toLocaleString("en-IN")}
                </td>

                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setEditId(emp.id);
                        setEmployeeCode(emp.employee_code);
                        setName(emp.name);
                        setRole(emp.role);
                        setSalary(emp.salary);
                      }}
                      className="bg-blue-100 text-blue-700 px-5 py-2 rounded-xl hover:bg-blue-200 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteEmployee(emp.id)
                      }
                      className="bg-red-100 text-red-600 px-5 py-2 rounded-xl hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}