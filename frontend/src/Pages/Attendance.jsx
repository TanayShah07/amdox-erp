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

      setAttendance(data);
    } catch (err) {
      console.log(err);
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
        fetchAttendance();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
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
        fetchAttendance();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
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
              className="bg-green-500 text-white px-5 py-3 rounded-lg"
            >
              Clock In
            </button>

            <button
              onClick={clockOut}
              className="bg-red-500 text-white px-5 py-3 rounded-lg"
            >
              Clock Out
            </button>
          </div>

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
                    className="border-t"
                  >
                    <td className="p-4">
                      {item.name}
                    </td>

                    <td className="p-4">
                      {item.date?.split("T")[0]}
                    </td>

                    <td className="p-4">
                      {item.clock_in
                        ? new Date(
                            item.clock_in
                          ).toLocaleTimeString()
                        : "-"}
                    </td>

                    <td className="p-4">
                      {item.clock_out
                        ? new Date(
                            item.clock_out
                          ).toLocaleTimeString()
                        : "-"}
                    </td>

                    <td className="p-4">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}