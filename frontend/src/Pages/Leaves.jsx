import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Leaves() {
  const navigate = useNavigate();

  const [leaves, setLeaves] =
    useState([]);

  const [employeeId, setEmployeeId] =
    useState("");

  const [leaveType, setLeaveType] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  
  const [loading, setLoading] =
    useState(false);

  const token =
    localStorage.getItem("token");

  const role =
    localStorage.getItem("role");

  // CHECK TOKEN
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, []);

  // FETCH LEAVES
  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/leaves",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // TOKEN EXPIRED
      if (res.status === 401) {
        localStorage.removeItem("token");

        localStorage.removeItem("role");

        toast.error("Session Expired");

        navigate("/");

        return;
      }

      const data = await res.json();

      console.log(data);

      setLeaves(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.log(err);

      toast.error(
        "Failed to fetch leaves"
      );
    } finally {
      setLoading(false);
    }
  };

  // APPLY LEAVE
  const applyLeave = async () => {
    if (
      !employeeId ||
      !leaveType ||
      !reason ||
      !fromDate ||
      !toDate
    ) {
      toast.error(
        "All fields are required"
      );

      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/leaves",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

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
        toast.error(
          data.message ||
            "Failed to apply leave"
        );
      }
    } catch (err) {
      console.log(err);

      toast.error(
        "Failed to apply leave"
      );
    }
  };

  // APPROVE LEAVE
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

  // REJECT LEAVE
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
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
     

      <div className="w-full">
        <div className="p-4 md:p-6 pt-20">
          {/* HEADER */}
          <div className="flex items-center gap-4 mb-6">
           

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Leave Management
              </h1>

              <p className="text-gray-500 text-sm md:text-base">
                Manage employee leave
                requests
              </p>
            </div>
          </div>

          {/* APPLY LEAVE FORM */}
          <div className="bg-white p-6 rounded-2xl shadow mb-6">
            <h2 className="text-xl font-semibold mb-5">
              Apply Leave
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) =>
                  setEmployeeId(
                    e.target.value.toUpperCase()
                  )
                }
                className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              />

              <select
                value={leaveType}
                onChange={(e) =>
                  setLeaveType(
                    e.target.value
                  )
                }
                className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
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
                  setFromDate(
                    e.target.value
                  )
                }
                className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="date"
                value={toDate}
                onChange={(e) =>
                  setToDate(
                    e.target.value
                  )
                }
                className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              />

              <textarea
                placeholder="Reason"
                value={reason}
                onChange={(e) =>
                  setReason(
                    e.target.value
                  )
                }
                className="border p-3 rounded-lg md:col-span-2 outline-none focus:ring-2 focus:ring-blue-400"
                rows={4}
              />

<button
  onClick={applyLeave}
  className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition md:col-span-2"
>
  Apply Leave
</button>
</div>
</div>

<div className="flex gap-4 mb-5">

  <a href="http://localhost:5000/reports/leaves/pdf">

    <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-lg">
      Export PDF
    </button>

  </a>

  <a href="http://localhost:5000/reports/leaves/excel">

    <button className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-lg">
      Export Excel
    </button>

  </a>

</div>
          {/* TABLE */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="text-xl font-semibold">
                Leave Records
              </h2>
            </div>
                    
{loading ? (
  <div className="p-10 text-center text-gray-500">
    Loading Leaves...
  </div>
) : leaves.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                No Leave Records Found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-sm">
                  <thead className="bg-gray-100 text-gray-700">
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

                     {(role === "admin" || role === "hr") && (
  <th className="p-4 text-left">
    Actions
  </th>
)}
                    </tr>
                  </thead>

                  <tbody>
                    {leaves.map(
                      (item) => (
                        <tr
                          key={item.id}
                          className="border-t hover:bg-gray-50 transition"
                        >
                          <td className="p-4 font-semibold text-blue-700">
                            {item.employee_code ||
                              "-"}
                          </td>

                          <td className="p-4 font-medium">
                            {item.name ||
                              "-"}
                          </td>

                          <td className="p-4">
                            {item.leave_type}
                          </td>

                          <td className="p-4">
                            {item.reason}
                          </td>

                          <td className="p-4">
                            {item.from_date?.split(
                              "T"
                            )[0] || "-"}
                          </td>

                          <td className="p-4">
                            {item.to_date?.split(
                              "T"
                            )[0] || "-"}
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                                item.status ===
                                "Approved"
                                  ? "bg-green-500"
                                  : item.status ===
                                    "Rejected"
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          {(role === "admin" || role === "hr") && (
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    approveLeave(
                                      item.id
                                    )
                                  }
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                                >
                                  Approve
                                </button>

                                <button
                                  onClick={() =>
                                    rejectLeave(
                                      item.id
                                    )
                                  }
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}