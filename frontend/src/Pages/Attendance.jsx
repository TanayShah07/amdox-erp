import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Attendance() {
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDate,setSelectedDate]=useState("");
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // CHECK TOKEN
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, []);

  // FETCH ATTENDANCE
  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/attendance",
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

      setAttendance(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.log(err);

      toast.error(
        "Failed to fetch attendance"
      );
    } finally {
      setLoading(false);
    }
  };
  
  // CLOCK IN
const clockIn = async () => {
  try {
    const res = await fetch(
      "http://localhost:5000/attendance/clock-in",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    toast.error("Clock In failed");
  }
};

  // CLOCK OUT
const clockOut = async () => {
  try {
    const res = await fetch(
      "http://localhost:5000/attendance/clock-out",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    toast.error("Clock Out failed");
  }
};

  useEffect(()=>{
  fetchAttendance();
  const interval=setInterval(()=>{
  fetchAttendance();
  },30000);
  return ()=>clearInterval(interval);
  },[]);

  const pageTitleStyle = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#111827",
  marginBottom: "24px",
};

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      

      {/* MAIN CONTENT */}
      <div className="w-full">
        <div className="p-4 md:p-6 pt-20">
          {/* HEADER */}
          <div className="flex items-center gap-4 mb-6">
            

            <div>
              <h1 style={pageTitleStyle}>
              Attendance
             </h1>

              <p className="text-gray-500 text-sm md:text-base">
                Manage employee
                attendance records
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500">Total Records</p>
            <h2 className="text-3xl font-bold text-blue-600">
              {attendance.length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500">Present</p>
            <h2 className="text-3xl font-bold text-green-600">
              {attendance.filter(a => a.status === "Present").length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500">Clocked In</p>
            <h2 className="text-3xl font-bold text-indigo-600">
              {attendance.filter(a => a.clock_in).length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500">Clocked Out</p>
            <h2 className="text-3xl font-bold text-red-600">
              {attendance.filter(a => a.clock_out).length}
            </h2>
          </div>

        </div>

          {/* CLOCK BOX */}
          <div className="bg-white p-6 rounded-2xl shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Employee Attendance
            </h2>

            <div className="flex flex-col lg:flex-row gap-4">
              {role !== "employee" && (
                <input
                  type="text"
                  placeholder="Employee ID"
                  value={employeeId}
                  onChange={(e) =>
                  setEmployeeId(e.target.value.toUpperCase())
                 }
                 className="border border-gray-300 p-3 rounded-lg flex-1 outline-none focus:ring-2 focus:ring-blue-400"
                />
              )}

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

          {role !== "employee" && (
          <div className="flex gap-4 mb-5">
            <a href="http://localhost:5000/reports/attendance/pdf">
              <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-lg">
                Export PDF
              </button>
            </a>

            <a href="http://localhost:5000/reports/attendance/excel">
              <button className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-lg">
                Export Excel
              </button>
            </a>
          </div>
          )}

          <input
            type="text"
            placeholder="Search Employee..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            className="border p-3 rounded-lg mb-4 w-80"
          />

          <input
            type="date"
            value={selectedDate}
            onChange={(e)=>setSelectedDate(e.target.value)}
            className="border rounded-xl px-4 py-2"
         />

        
          {/* TABLE */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="text-xl font-semibold">
                Attendance Records
              </h2>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-500">
                Loading Attendance...
              </div>
            ) : attendance.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                No Attendance Records
                Found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
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
                        Working Hours
                      </th>

                      <th className="p-4 text-left">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {attendance
                    .filter((item)=>{

                      const matchSearch =
                        item.employee_name
                        ?.toLowerCase()
                        .includes(
                          search.toLowerCase()
                        );

                      const matchDate =
                        !selectedDate ||
                        item.date
                        ?.split("T")[0] === selectedDate;
                      return matchSearch && matchDate;
                    })
                    .map(
                    (item)=>(
                        <tr
                          key={item.id}
                          className={`border-t transition hover:bg-gray-50 ${
                            item.date &&
                            new Date(item.date).toDateString() ===
                              new Date().toDateString()
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <td className="p-4 font-semibold text-blue-700">
                            {item.employee_id ||
                              "-"}
                          </td>

                          <td className="p-4">
                            {item.employee_name ||
                              "-"}
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
                                ).toLocaleTimeString(
                                  [],
                                  {
                                    hour:
                                      "2-digit",
                                    minute:
                                      "2-digit",
                                  }
                                )
                              : "-"}
                          </td>

                          <td className="p-4">
                          {item.clock_in && item.clock_out
                          ? `${(
                            (new Date(item.clock_out) -
                            new Date(item.clock_in))
                            /(1000*60*60)
                          ).toFixed(2)} hrs`
                          : "-"}
                          </td>


                          <td className="p-4">
                          <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status==="Present"
                          ?"bg-green-100 text-green-700"
                          :item.status==="Absent"
                          ?"bg-red-100 text-red-700"
                          :"bg-yellow-100 text-yellow-700"
                          }`}
                          >
                          {item.status}
                          </span>
                          </td>
                          <td className="p-4">
                            {item.clock_in && item.clock_out
                              ? `${(
                                  (new Date(item.clock_out) -
                                    new Date(item.clock_in)) /
                                  (1000 * 60 * 60)
                                ).toFixed(2)} hrs`
                              : "-"}
                          </td>
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