import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";

export default function Payroll() {

  const [payroll, setPayroll] = useState([]);

  const [employeeCode, setEmployeeCode] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [basicSalary, setBasicSalary] = useState("");
  const [bonus, setBonus] = useState("");
  const [deductions, setDeductions] = useState("");

  const [isOpen, setIsOpen] = useState(true);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const fetchPayroll = async () => {

    try {

      const res = await fetch(
        "http://localhost:5000/payroll",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setPayroll(Array.isArray(data) ? data : []);

    } catch (err) {

      console.log(err);

      toast.error("Failed to fetch payroll");

    }
  };

  const addPayroll = async () => {

    if (
      !employeeCode ||
      !employeeName ||
      !basicSalary
    ) {
      toast.error("Fill all required fields");
      return;
    }

    try {

      const res = await fetch(
        "http://localhost:5000/payroll",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            employee_code: employeeCode,
            employee_name: employeeName,
            basic_salary: basicSalary,
            bonus,
            deductions,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {

        toast.success(data.message);

        setEmployeeCode("");
        setEmployeeName("");
        setBasicSalary("");
        setBonus("");
        setDeductions("");

        fetchPayroll();

      } else {

        toast.error("Failed");

      }

    } catch (err) {

      console.log(err);

      toast.error("Payroll add failed");

    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="p-6 pt-20">

          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="bg-white p-2 rounded shadow mb-4"
            >
              ☰
            </button>
          )}

          <h1 className="text-3xl font-bold mb-6">
            Payroll Management
          </h1>

          {/* ADD PAYROLL */}

          {(role === "admin" || role === "hr") && (

            <div className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                type="text"
                placeholder="Employee Code"
                value={employeeCode}
                onChange={(e) =>
                  setEmployeeCode(
                    e.target.value.toUpperCase()
                  )
                }
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                placeholder="Employee Name"
                value={employeeName}
                onChange={(e) =>
                  setEmployeeName(e.target.value)
                }
                className="border p-3 rounded-lg"
              />

              <input
                type="number"
                placeholder="Basic Salary"
                value={basicSalary}
                onChange={(e) =>
                  setBasicSalary(e.target.value)
                }
                className="border p-3 rounded-lg"
              />

              <input
                type="number"
                placeholder="Bonus"
                value={bonus}
                onChange={(e) =>
                  setBonus(e.target.value)
                }
                className="border p-3 rounded-lg"
              />

              <input
                type="number"
                placeholder="Deductions"
                value={deductions}
                onChange={(e) =>
                  setDeductions(e.target.value)
                }
                className="border p-3 rounded-lg"
              />

              <button
                onClick={addPayroll}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
              >
                Add Payroll
              </button>

            </div>
          )}

          {/* PAYROLL TABLE */}

          <div className="bg-white rounded-xl shadow overflow-auto">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="p-4 text-left">
                    Employee Code
                  </th>

                  <th className="p-4 text-left">
                    Employee Name
                  </th>

                  <th className="p-4 text-left">
                    Salary
                  </th>

                  <th className="p-4 text-left">
                    Bonus
                  </th>

                  <th className="p-4 text-left">
                    Deductions
                  </th>

                  <th className="p-4 text-left">
                    Net Salary
                  </th>

                  <th className="p-4 text-left">
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {payroll.map((item) => (

                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="p-4">
                      {item.employee_code}
                    </td>

                    <td className="p-4">
                      {item.employee_name}
                    </td>

                    <td className="p-4">
                      ₹ {item.basic_salary}
                    </td>

                    <td className="p-4 text-green-600">
                      ₹ {item.bonus}
                    </td>

                    <td className="p-4 text-red-600">
                      ₹ {item.deductions}
                    </td>

                    <td className="p-4 font-bold text-blue-700">
                      ₹ {item.net_salary}
                    </td>

                    <td className="p-4">
                      {item.pay_date?.split("T")[0]}
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
    </div>
  );
}