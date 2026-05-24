import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";

export default function Leaves() {
  const [leaves, setLeaves] = useState([]);

  const [employeeId, setEmployeeId] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const fetchLeaves = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/leaves",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch leaves");
    }
  };

  const applyLeave = async () => {
    if (
      !employeeId ||
      !leaveType ||
      !reason ||
      !fromDate ||
      !toDate
    ) {
      toast.error("All fields required");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/leaves",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            employee_id: employeeId,
            leave_type: leaveType,
            reason,
            from_date: fromDate,
            to_date: toDate,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);

        setEmployeeId("");
        setLeaveType("");
        setReason("");
        setFromDate("");
        setToDate("");

        fetchLeaves();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to apply leave");
    }
  };

  const approveLeave = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/leaves/${id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      toast.success(data.message);

      fetchLeaves();
    } catch (err) {
      console.log(err);
      toast.error("Approve failed");
    }
  };

  const rejectLeave = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/leaves/${id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      toast.success(data.message);

      fetchLeaves();
    } catch (err) {
      console.log(err);
      toast.error("Reject failed");
    }
  };

  useEffect(() => {
    fetchLeaves();
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
            Leave Management
          </h1>

          {/* APPLY LEAVE FORM */}

          <div className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Enter Employee ID (EMP001)"
              value={employeeId}
              onChange={(e) =>
                setEmployeeId(
                  e.target.value.toUpperCase()
                )
              }
              className="border p-3 rounded-lg"
            />

            <select
              value={leaveType}
              onChange={(e) =>
                setLeaveType(e.target.value)
              }
              className="border p-3 rounded-lg"
            >
              <option value="">
                Select Leave Type
              </option>

              <option value="Sick Leave">
                Sick Leave
              </option>

              <option value="Casual Leave">
                Casual Leave
              </option>

              <option value="Paid Leave">
                Paid Leave
              </option>
            </select>

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(e.target.value)
              }
              className="border p-3 rounded-lg"
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(e.target.value)
              }
              className="border p-3 rounded-lg"
            />

            <textarea
              placeholder="Reason"
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              className="border p-3 rounded-lg md:col-span-2"
            />

            <button
              onClick={applyLeave}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg md:col-span-2"
            >
              Apply Leave
            </button>
          </div>

          {/* LEAVES TABLE */}

          <div className="bg-white rounded-xl shadow overflow-auto">
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
                    Leave Type
                  </th>

                  <th className="p-4 text-left">
                    Reason
                  </th>

                  <th className="p-4 text-left">
                    From
                  </th>

                  <th className="p-4 text-left">
                    To
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                  {(role === "admin" ||
                  role === "hr") && (
                    <th className="p-4 text-left">
                      Actions
                    </th>
                  )}

                </tr>
              </thead>

              <tbody>
                {leaves.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="p-4 font-semibold">
                      {item.employee_code || "-"}
                    </td>

                    <td className="p-4">
                      {item.name || "-"}
                    </td>

                    <td className="p-4">
                      {item.leave_type}
                    </td>

                    <td className="p-4">
                      {item.reason}
                    </td>

                    <td className="p-4">
                      {item.from_date?.split("T")[0]}
                    </td>

                    <td className="p-4">
                      {item.to_date?.split("T")[0]}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-white ${
                          item.status === "Approved"
                            ? "bg-green-500"
                            : item.status === "Rejected"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {(role === "admin" ||
                     role === "hr") && (
                      <td className="p-4 flex gap-2">

                        <button
                          onClick={() =>
                            approveLeave(item.id)
                          }
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            rejectLeave(item.id)
                          }
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Reject
                        </button>

                      </td>
                    )}

                  </tr>
                ))}
              </tbody>
            </table>

            {leaves.length === 0 && (
              <div className="p-10 text-center text-gray-500">
                No Leave Records Found
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}