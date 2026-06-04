import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Employees() {
  const userRole = localStorage.getItem("role");

  const [employees, setEmployees] = useState([
    {
      id: 1,
      employee_code: "EMP001",
      name: "Sai",
      role: "Developer",
      salary: 50000,
      projects: 3,
    },
    {
      id: 2,
      employee_code: "EMP002",
      name: "Lakshmi",
      role: "HR",
      salary: 45000,
      projects: 2,
    },
    {
      id: 3,
      employee_code: "EMP003",
      name: "Rahul",
      role: "Manager",
      salary: 70000,
      projects: 5,
    },
  ]);

  const [roles, setRoles] = useState([]);
  const [employeeCode, setEmployeeCode] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [projects, setProjects] = useState("");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const uniqueRoles = [...new Set(employees.map((e) => e.role))];
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
  const addEmployee = () => {
    if (!employeeCode || !name || !role || !salary || !projects) {
      toast.error("Please fill all fields");
      return;
    }

    if (editId) {
      setEmployees(
        employees.map((emp) =>
          emp.id === editId
            ? { ...emp, employee_code: employeeCode, name, role, salary, projects }
            : emp
        )
      );
      toast.success("Employee Updated");
      setEditId(null);
    } else {
      setEmployees([
        ...employees,
        {
          id: Date.now(),
          employee_code: employeeCode,
          name,
          role,
          salary,
          projects,
        },
      ]);
      toast.success("Employee Added");
    }

    setEmployeeCode("");
    setName("");
    setRole("");
    setSalary("");
    setProjects("");
  };

  // ================= DELETE =================
  const deleteEmployee = (id) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
    toast.success("Employee Deleted");
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
            Total: {employees.length}
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            Roles: {roles.length}
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            Projects:{" "}
            {employees.reduce((a, b) => a + Number(b.projects), 0)}
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
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Salary</th>
                <th>Projects</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.employee_code}</td>
                  <td>{emp.name}</td>
                  <td>
                    <span className={getRoleColor(emp.role)}>
                      {emp.role}
                    </span>
                  </td>
                  <td>{emp.salary}</td>
                  <td>{emp.projects}</td>

                  <td>
                    <button onClick={() => setEditId(emp.id)}>
                      Edit
                    </button>

                    <button onClick={() => deleteEmployee(emp.id)}>
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
}