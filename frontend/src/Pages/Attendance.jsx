import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const token = localStorage.getItem("token");

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

            <h1 className="text-3xl font-bold text-gray-800">
              Attendance Management
            </h1>
          </div>

          {/* Clock In / Clock Out Box */}

          <div className="bg-white p-6 rounded-2xl shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Employee Attendance
            </h2>

            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter Employee ID"
                value={employeeId}
                onChange={(e) =>
                  setEmployeeId(e.target.value)
                }
                className="border border-gray-300 p-3 rounded-lg flex-1 outline-none focus:ring-2 focus:ring-blue-400"
              />

              <button
                onClick={clockIn}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                Clock In
              </button>

              <button
                onClick={clockOut}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                Clock Out
              </button>
            </div>
          </div>

          {/* Attendance Table */}

          <div className="bg-white rounded-2xl shadow overflow-hidden">

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-4 text-left">
                      Employee ID
                    </th>

                    <th className="p-4 text-left">
                      Employee Name
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
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="p-4 font-semibold text-gray-700">
                        {item.employee_id || "-"}
                      </td>

                      <td className="p-4">
                        {item.employee_name || "-"}
                      </td>

                      <td className="p-4">
                        {item.date
                          ? new Date(
                              item.date
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="p-4 text-green-600 font-medium">
                        {item.clock_in
                          ? new Date(
                              item.clock_in
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>

                      <td className="p-4 text-red-600 font-medium">
                        {item.clock_out
                          ? new Date(
                              item.clock_out
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
            </div>

            {attendance.length === 0 && (
              <div className="p-10 text-center text-gray-500">
                No Attendance Records Found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}