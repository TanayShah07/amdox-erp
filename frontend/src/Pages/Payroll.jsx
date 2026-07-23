import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Payroll() {

  const [payroll, setPayroll] = useState([]);

  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [basicSalary, setBasicSalary] = useState("");
  const [bonus, setBonus] = useState("");
  const [deductions, setDeductions] = useState("");

  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // FETCH PAYROLL

  const fetchPayroll = async () => {

    try {

      setLoading(true);

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

    } finally {

      setLoading(false);

    }

  };

  // ADD PAYROLL

  const addPayroll = async () => {

    if (
      !employeeId ||
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
            employee_id: employeeId,
            employee_name: employeeName,
            basic_salary: basicSalary,
            bonus,
            deductions,
            pay_date: new Date(),
          }),
        }
      );

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

        toast.error(
          data.message ||
            "Failed to add payroll"
        );

      }

    } catch (err) {

      console.log(err);

      toast.error("Payroll add failed");

    }

  };

  useEffect(() => {

    fetchPayroll();

    const interval = setInterval(() => {

      fetchPayroll();

    }, 30000);

    return () => clearInterval(interval);

  }, []);

  const filteredPayroll = payroll.filter((item) => {

    const matchSearch =
      item.employee_name
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchDate =
      !selectedDate ||
      item.pay_date?.split("T")[0] === selectedDate;

    return matchSearch && matchDate;

  });

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

      {/* DASHBOARD CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500">
            Employees
          </p>

          <h2 className="text-3xl font-bold text-blue-600">
            {payroll.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500">
            Total Salary
          </p>

          <h2 className="text-3xl font-bold text-green-600">
            ₹
            {payroll
              .reduce(
                (sum, p) =>
                  sum +
                  Number(
                    p.basic_salary || 0
                  ),
                0
              )
              .toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500">
            Total Bonus
          </p>

          <h2 className="text-3xl font-bold text-indigo-600">
            ₹
            {payroll
              .reduce(
                (sum, p) =>
                  sum +
                  Number(p.bonus || 0),
                0
              )
              .toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500">
            Net Payroll
          </p>

          <h2 className="text-3xl font-bold text-red-600">
            ₹
            {payroll
              .reduce(
                (sum, p) =>
                  sum +
                  Number(
                    p.net_salary || 0
                  ),
                0
              )
              .toLocaleString("en-IN")}
          </h2>
        </div>

      </div>

      {/* ADD PAYROLL FORM */}

      {(role === "admin" ||
        role === "hr") && (

        <div className="bg-white p-6 rounded-2xl shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) =>
              setEmployeeId(
                e.target.value.toUpperCase()
              )
            }
            className="border p-3 rounded-xl"
          />

          <input
            type="text"
            placeholder="Employee Name"
            value={employeeName}
            onChange={(e) =>
              setEmployeeName(
                e.target.value
              )
            }
            className="border p-3 rounded-xl"
          />

          <input
            type="number"
            placeholder="Basic Salary"
            value={basicSalary}
            onChange={(e) =>
              setBasicSalary(
                e.target.value
              )
            }
            className="border p-3 rounded-xl"
          />

          <input
            type="number"
            placeholder="Bonus"
            value={bonus}
            onChange={(e) =>
              setBonus(
                e.target.value
              )
            }
            className="border p-3 rounded-xl"
          />

          <input
            type="number"
            placeholder="Deductions"
            value={deductions}
            onChange={(e) =>
              setDeductions(
                e.target.value
              )
            }
            className="border p-3 rounded-xl"
          />

          <button
            onClick={addPayroll}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
          >
            Add Payroll
          </button>

        </div>

      )}

      {/* EXPORT */}

      {role !== "employee" && (

        <div className="flex gap-4 mb-5">

          <a href="http://localhost:5000/reports/payroll/pdf">
            <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-lg">
              Export PDF
            </button>
          </a>

          <a href="http://localhost:5000/reports/payroll/excel">
            <button className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-lg">
              Export Excel
            </button>
          </a>

        </div>

      )}

      {/* SEARCH */}

      {role !== "employee" && (

        <div className="flex gap-3 mb-5">

          <input
            type="text"
            placeholder="Search Employee..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="border rounded-xl px-4 py-3 w-80"
          />

          <input
            type="date"
            value={selectedDate}
            onChange={(e) =>
              setSelectedDate(
                e.target.value
              )
            }
            className="border rounded-xl px-4 py-3"
          />

        </div>

      )}
            {/* TABLE */}

      <div className="bg-white rounded-2xl shadow overflow-x-auto">

        {loading ? (

          <div className="p-10 text-center text-gray-500">
            Loading Payroll...
          </div>

        ) : filteredPayroll.length === 0 ? (

          <div className="p-10 text-center text-gray-500">
            No Payroll Records
          </div>

        ) : (

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="p-4 text-left">
                  Employee ID
                </th>

                <th className="p-4 text-left">
                  Employee Name
                </th>

                <th className="p-4 text-left">
                  Basic Salary
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
                  Pay Date
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredPayroll.map((item) => (

                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50 transition"
                >

                  <td className="p-4 font-semibold text-blue-700">
                    {item.employee_id || "-"}
                  </td>

                  <td className="p-4">
                    {item.employee_name || "-"}
                  </td>

                  <td className="p-4 font-medium">
                    ₹{" "}
                    {Number(
                      item.basic_salary || 0
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="p-4 text-green-600 font-medium">
                    ₹{" "}
                    {Number(
                      item.bonus || 0
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="p-4 text-red-600 font-medium">
                    ₹{" "}
                    {Number(
                      item.deductions || 0
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="p-4 font-bold text-blue-700">
                    ₹{" "}
                    {Number(
                      item.net_salary || 0
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="p-4">
                    {item.pay_date
                      ? item.pay_date.split("T")[0]
                      : "-"}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>

  </div>

);
}