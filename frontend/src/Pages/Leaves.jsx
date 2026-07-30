import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


export default function Leaves() {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [search,setSearch]=useState("");
  const [selectedDate,setSelectedDate]=useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

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
      !leaveType ||
      !reason ||
      !fromDate ||
      !toDate ||
      (role !== "employee" && !employeeId)
    ) 
    {
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
            ...(role !== "employee" && {
              employee_id: employeeId,
            }),
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

    useEffect(()=>{
    fetchLeaves();
    const interval=setInterval(()=>{
    fetchLeaves();
    },30000);
    return ()=>clearInterval(interval);
    },[]);

  const pageTitleStyle = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#111827",
  marginBottom: "24px",
};

const filteredLeaves = leaves.filter((item) => {

  const matchSearch =
    item.employee_name
      ?.toLowerCase()
      .includes(search.toLowerCase());

  const matchDate =
    !selectedDate ||
    item.from_date?.split("T")[0] === selectedDate;

  return matchSearch && matchDate;

});
  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
     

      <div className="w-full">
        <div className="p-4 md:p-6 pt-20">
          {/* HEADER */}
          <div className="flex items-center gap-4 mb-6">     
            <div>
              <h1 style={pageTitleStyle}>
              Leaves
             </h1>

              <p className="text-gray-500 text-sm md:text-base">
                Manage employee leave
                requests
              </p>
            </div>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
              <div className="bg-white rounded-2xl shadow p-5">
                <p className="text-gray-500">Total Leaves</p>
                <h2 className="text-3xl font-bold text-blue-600">
                {leaves.length}
                </h2>
              </div>
              <div className="bg-white rounded-2xl shadow p-5">
                <p className="text-gray-500">Pending</p>
                <h2 className="text-3xl font-bold text-yellow-600">
                {leaves.filter(l=>l.status==="Pending").length}
                </h2>
              </div>
              <div className="bg-white rounded-2xl shadow p-5">
                <p className="text-gray-500">Approved</p>
                <h2 className="text-3xl font-bold text-green-600">
                {leaves.filter(l=>l.status==="Approved").length}
                </h2>
              </div>
              <div className="bg-white rounded-2xl shadow p-5">
                <p className="text-gray-500">Rejected</p>
                <h2 className="text-3xl font-bold text-red-600">
                {leaves.filter(l=>l.status==="Rejected").length}
                </h2>
              </div>

            </div>

          {/* APPLY LEAVE FORM */}
          <div className="bg-white p-6 rounded-2xl shadow mb-6">
            <h2 className="text-xl font-semibold mb-5">
              Apply Leave
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {role !== "employee" && (
                <input
                type="text"
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e)=>
                setEmployeeId(e.target.value.toUpperCase())
                }
                className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                />
                )}
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
                {role !== "employee" && (
                <div className="flex gap-4 mb-5">

                  <a href="http://localhost:5000/leaves/pdf">

                    <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-lg">
                      Export PDF
                    </button>

                  </a>
                  <a href="http://localhost:5000/leaves/excel">
                    <button className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-lg">
                      Export Excel
                    </button>
                  </a>
                </div>
                )}

                {role !== "employee" && (

              <div className="flex gap-3 mb-5">

                <input
                type="text"
                placeholder="Search Employee..."
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                className="border rounded-xl px-4 py-3 w-80"
                />

                <input
                type="date"
                value={selectedDate}
                onChange={(e)=>setSelectedDate(e.target.value)}
                className="border rounded-xl px-4 py-3"
                />

              </div>

              )}


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
  {filteredLeaves.map((item) => (
    <tr
      key={item.id}
      className="border-t hover:bg-gray-50 transition"
    >
      <td className="p-4 font-semibold text-blue-700">
        {item.employee_id || "-"}
      </td>

      <td className="p-4 font-medium">
        {item.employee_name || "-"}
      </td>

      <td className="p-4">
        {item.leave_type}
      </td>

      <td className="p-4">
        {item.reason}
      </td>

      <td className="p-4">
        {item.from_date?.split("T")[0] || "-"}
      </td>

      <td className="p-4">
        {item.to_date?.split("T")[0] || "-"}
      </td>

      <td className="p-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
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

        {(role === "admin" || role === "hr") &&
        item.status === "Pending" && (
        <td className="p-4">
          <div className="flex gap-2">
            <button
              onClick={() => approveLeave(item.id)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
            >
              Approve
            </button>

            <button
              onClick={() => rejectLeave(item.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
            >
              Reject
            </button>
          </div>
        </td>
      )}
    </tr>
  ))}
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