import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Payroll() {
  const [payroll, setPayroll] = useState([]);

  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [basicSalary, setBasicSalary] = useState("");
  const [bonus, setBonus] = useState("");
  const [deductions, setDeductions] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // FETCH PAYROLL
  const fetchPayroll = async () => {
    try {
      const res = await fetch("http://localhost:5000/payroll", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setPayroll(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch payroll");
    }
  };

  // ADD PAYROLL
  const addPayroll = async () => {
    if (!employeeId || !employeeName || !basicSalary) {
      toast.error("Fill all required fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/payroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_id: employeeId,
          employee_name: employeeName,
          basic_salary: basicSalary,
          bonus,
          deductions,
          pay_date: new Date(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);

        setEmployeeId("");
        setEmployeeName("");
        setBasicSalary("");
        setBonus("");
        setDeductions("");

        fetchPayroll();
      } else {
        toast.error(data.message || "Failed to add payroll");
      }
    } catch (err) {
      console.log(err);
      toast.error("Payroll add failed");
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const pageTitleStyle = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#111827",
  marginBottom: "24px",
};

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="p-8">
        <h1 style={pageTitleStyle}>
          Payroll Management
        </h1>

        {/* FORM */}
        {(role === "admin" || role === "hr") && (
          <div className="bg-white p-6 rounded-2xl shadow mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Employee Id"
              value={employeeId}
              onChange={(e) =>
                setEmployeeId(e.target.value.toUpperCase())
              }
              className="border p-3 rounded-xl"
            />

            <input
              type="text"
              placeholder="Employee Name"
              value={employeeName}
              onChange={(e) =>
                setEmployeeName(e.target.value)
              }
              className="border p-3 rounded-xl"
            />

            <input
              type="number"
              placeholder="Basic Salary"
              value={basicSalary}
              onChange={(e) =>
                setBasicSalary(e.target.value)
              }
              className="border p-3 rounded-xl"
            />

            <input
              type="number"
              placeholder="Bonus"
              value={bonus}
              onChange={(e) =>
                setBonus(e.target.value)
              }
              className="border p-3 rounded-xl"
            />

            <input
              type="number"
              placeholder="Deductions"
              value={deductions}
              onChange={(e) =>
                setDeductions(e.target.value)
              }
              className="border p-3 rounded-xl"
            />

            <button
              onClick={addPayroll}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
            >
              Add Payroll
            </button>
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Employee Id</th>
                <th className="p-4 text-left">Employee Name</th>
                <th className="p-4 text-left">Salary</th>
                <th className="p-4 text-left">Bonus</th>
                <th className="p-4 text-left">Deductions</th>
                <th className="p-4 text-left">Net Salary</th>
                <th className="p-4 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {payroll.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">{item.employee_id || "-"}</td>

                  <td className="p-4">{item.employee_name || "-"}</td>

                  <td className="p-4">₹ {item.basic_salary}</td>

                  <td className="p-4 text-green-600">
                    ₹ {item.bonus || 0}
                  </td>

                  <td className="p-4 text-red-600">
                    ₹ {item.deductions || 0}
                  </td>

                  <td className="p-4 font-bold text-blue-700">
                    ₹ {item.net_salary}
                  </td>

                  <td className="p-4">
                    {item.pay_date?.split("T")[0] || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {payroll.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              No Payroll Records
            </div>
          )}
        </div>
      </div>
    </div>
  );
}