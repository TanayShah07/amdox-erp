import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Search,
  Plus,
  Download,
  FileText,
  Users,
  Briefcase,
  IndianRupee,
  Layers3,
  X,
} from "lucide-react";

export default function Employees() {
  const role = localStorage.getItem("role");

  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [employeeCode, setEmployeeCode] = useState("");
  const [name, setName] = useState("");
  const [employeeRole, setEmployeeRole] = useState("");
  const [salary, setSalary] = useState("");
  const [projects, setProjects] = useState("");

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:5000/employees");
      const data = await res.json();

      setEmployees(Array.isArray(data) ? data : []);

      const uniqueRoles = [
        ...new Set(
          (Array.isArray(data) ? data : []).map((e) => e.role)
        ),
      ];

      setRoles(uniqueRoles);
    } catch (err) {
      console.log(err);
      toast.error("Unable to load employees");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const resetForm = () => {
    setEmployeeCode("");
    setName("");
    setEmployeeRole("");
    setSalary("");
    setProjects("");
    setEditId(null);
    setShowForm(false);
  };

  const saveEmployee = async () => {
    if (!employeeCode || !name || !employeeRole || !salary) {
      toast.error("Please fill all required fields");
      return;
    }

    const url = editId
      ? `http://localhost:5000/employees/${editId}`
      : "http://localhost:5000/employees";

    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_code: employeeCode,
          name,
          role: employeeRole,
          salary,
          projects,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          editId
            ? "Employee Updated"
            : "Employee Added"
        );

        resetForm();
        fetchEmployees();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch {
      toast.error("Server Error");
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        emp.employee_code
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesRole =
        filterRole === "" || emp.role === filterRole;

      return matchesSearch && matchesRole;
    });
  }, [employees, search, filterRole]);

  const totalSalary = employees.reduce(
    (sum, emp) => sum + Number(emp.salary || 0),
    0
  );

  const totalProjects = employees.reduce(
    (sum, emp) => sum + Number(emp.projects || 0),
    0
  );

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Employees");

    sheet.columns = [
      { header: "Employee ID", key: "employee_code", width: 20 },
      { header: "Name", key: "name", width: 25 },
      { header: "Role", key: "role", width: 20 },
      { header: "Salary", key: "salary", width: 15 },
    ];

    filteredEmployees.forEach((emp) => sheet.addRow(emp));

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer]);

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "employees.xlsx";

    link.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [["Employee ID", "Name", "Role", "Salary"]],
      body: filteredEmployees.map((e) => [
        e.employee_code,
        e.name,
        e.role,
        e.salary,
      ]),
    });

    doc.save("employees.pdf");
  };

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            Employees
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your organization's workforce
          </p>

        </div>

        {(role === "admin" || role === "hr") && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2"
          >
            <Plus size={18} />
            Add Employee
          </button>
        )}

      </div>

      {/* KPI Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <div className="bg-white rounded-2xl p-6 shadow">
          <Users className="text-blue-600 mb-3" />
          <h2 className="text-3xl font-bold">
            {employees.length}
          </h2>
          <p className="text-gray-500">
            Employees
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <Briefcase className="text-purple-600 mb-3" />
          <h2 className="text-3xl font-bold">
            {roles.length}
          </h2>
          <p className="text-gray-500">
            Roles
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <IndianRupee className="text-green-600 mb-3" />
          <h2 className="text-3xl font-bold">
            ₹{totalSalary}
          </h2>
          <p className="text-gray-500">
            Payroll
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <Layers3 className="text-orange-600 mb-3" />
          <h2 className="text-3xl font-bold">
            {totalProjects}
          </h2>
          <p className="text-gray-500">
            Projects
          </p>
        </div>

      </div>

      {/* Search */}

      <div className="bg-white rounded-2xl shadow p-5 flex flex-col md:flex-row gap-4">

        <div className="flex items-center border rounded-xl px-4 flex-1">
          <Search size={18} />
          <input
            className="w-full outline-none p-3"
            placeholder="Search by employee name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="border rounded-xl px-4"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">All Roles</option>

          {roles.map((r) => (
            <option key={r}>
              {r}
            </option>
          ))}
        </select>

        <button
          onClick={exportExcel}
          className="bg-green-600 text-white px-4 rounded-xl flex items-center gap-2"
        >
          <Download size={18} />
          Excel
        </button>

        <button
          onClick={exportPDF}
          className="bg-red-600 text-white px-4 rounded-xl flex items-center gap-2"
        >
          <FileText size={18} />
          PDF
        </button>

      </div>

      {/* Add / Edit Form */}

      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6">

          <div className="flex justify-between mb-5">

            <h2 className="text-xl font-bold">
              {editId ? "Edit Employee" : "Add Employee"}
            </h2>

            <button onClick={resetForm}>
              <X />
            </button>

          </div>

          <div className="grid md:grid-cols-5 gap-4">

            <input
              className="border rounded-xl p-3"
              placeholder="Employee ID"
              value={employeeCode}
              onChange={(e) =>
                setEmployeeCode(e.target.value)
              }
            />

            <input
              className="border rounded-xl p-3"
              placeholder="Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <input
              className="border rounded-xl p-3"
              placeholder="Role"
              value={employeeRole}
              onChange={(e) =>
                setEmployeeRole(e.target.value)
              }
            />

            <input
              className="border rounded-xl p-3"
              placeholder="Salary"
              value={salary}
              onChange={(e) =>
                setSalary(e.target.value)
              }
            />

            <input
              className="border rounded-xl p-3"
              placeholder="Projects"
              value={projects}
              onChange={(e) =>
                setProjects(e.target.value)
              }
            />

          </div>

          <button
            onClick={saveEmployee}
            className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-xl"
          >
            {editId ? "Update Employee" : "Save Employee"}
          </button>

        </div>
      )}

      
      <div className="bg-white rounded-2xl shadow overflow-hidden">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="px-6 py-4 text-left">Employee</th>

                <th className="px-6 py-4 text-left">Employee ID</th>

                <th className="px-6 py-4 text-left">Role</th>

                <th className="px-6 py-4 text-left">Salary</th>

                <th className="px-6 py-4 text-left">Projects</th>

                <th className="px-6 py-4 text-left">Status</th>

                {(role === "admin" || role === "hr") && (

                  <th className="px-6 py-4 text-center">

                    Action

                  </th>

                )}

              </tr>

            </thead>

            <tbody>

              {filteredEmployees.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="text-center py-12 text-gray-500"
                  >

                    No employees found.

                  </td>

                </tr>

              ) : (

                filteredEmployees.map((emp) => (

                  <tr
                    key={emp.id}
                    className="border-t hover:bg-gray-50 transition"
                  >

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">

                          {emp.name?.charAt(0).toUpperCase()}

                        </div>

                        <div>

                          <h3 className="font-semibold">

                            {emp.name}

                          </h3>

                          <p className="text-sm text-gray-500">

                            {emp.role}

                          </p>

                        </div>

                      </div>

                    </td>

                    <td className="px-6 py-4">

                      {emp.employee_code}

                    </td>

                    <td className="px-6 py-4">

                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">

                        {emp.role}

                      </span>

                    </td>

                    <td className="px-6 py-4 font-semibold text-green-600">

                      ₹ {emp.salary}

                    </td>

                    <td className="px-6 py-4">

                      {emp.projects || 0}

                    </td>

                    <td className="px-6 py-4">

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

                        Active

                      </span>

                    </td>

                    {(role === "admin" || role === "hr") && (

                      <td className="px-6 py-4">

                        <div className="flex justify-center gap-3">

                          <button
                            onClick={() => {
                              setEditId(emp.id);
                              setEmployeeCode(emp.employee_code);
                              setName(emp.name);
                              setEmployeeRole(emp.role);
                              setSalary(emp.salary);
                              setProjects(emp.projects);
                              setShowForm(true);
                            }}
                            className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center"
                          >

                            ✏️

                          </button>

                          <button
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  "Delete this employee?"
                                )
                              )
                                return;

                              await fetch(
                                `http://localhost:5000/employees/${emp.id}`,
                                {
                                  method: "DELETE",
                                }
                              );

                              toast.success(
                                "Employee Deleted"
                              );

                              fetchEmployees();
                            }}
                            className="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center"
                          >

                            🗑️

                          </button>

                        </div>

                      </td>

                    )}

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Footer */}

      <div className="flex justify-between items-center mt-6 text-sm text-gray-500">

        <p>

          Showing{" "}
          <span className="font-semibold">

            {filteredEmployees.length}

          </span>{" "}
          employee(s)

        </p>

        <p>

          ERP Employee Management Module

        </p>

      </div>

    </div>
  );
}