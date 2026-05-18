import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const fetchAttendance = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/attendance",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch attendance");
    }
  };

  const clockIn = async () => {
    if (!employeeId) {
      toast.error("Enter Employee ID");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/attendance/clock-in",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            employee_id: employeeId,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);

        setEmployeeId("");

        fetchAttendance();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Clock In failed");
    }
  };

  const clockOut = async () => {
    if (!employeeId) {
      toast.error("Enter Employee ID");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/attendance/clock-out",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            employee_id: employeeId,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);

        setEmployeeId("");

        fetchAttendance();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Clock Out failed");
    }
  };

  useEffect(() => {
    fetchAttendance();
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
          <div className="flex items-center gap-4 mb-6">
            {!isOpen && (
              <button
                onClick={() => setIsOpen(true)}
                className="bg-white p-2 rounded shadow"
              >
                ☰
              </button>
            )}

            <h1 className="text-3xl font-bold">
              Attendance Management
            </h1>
          </div>

          {(role === "admin" || role === "hr") && (
            <div className="bg-white p-6 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4">
              <input
                type="number"
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) =>
                  setEmployeeId(e.target.value)
                }
                className="border p-3 rounded-lg flex-1"
              />

              <button
                onClick={clockIn}
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-lg"
              >
                Clock In
              </button>

              <button
                onClick={clockOut}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-lg"
              >
                Clock Out
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl shadow overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">
                    Employee
                  </th>

                  <th className="p-4 text-left">
                    Date
                  </th>

                  <th className="p-4 text-left">
                    Clock In
                  </th>

                  <th className="p-4 text-left">
                    Clock Out
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {attendance.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-4">
                      {item.employee_name}
                    </td>

                    <td className="p-4">
                      {item.date}
                    </td>

                    <td className="p-4">
                      {item.clock_in || "-"}
                    </td>

                    <td className="p-4">
                      {item.clock_out || "-"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.status === "Present"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {attendance.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No Attendance Records
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}