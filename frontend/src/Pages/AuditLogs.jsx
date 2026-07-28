import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ClipboardList, Trash2 } from "lucide-react";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await fetch("http://localhost:5000/audit-logs");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load audit logs");
    }
  };

  useEffect(() => {
    fetchLogs();

    const interval = setInterval(fetchLogs, 30000);

    return () => clearInterval(interval);
  }, []);

  const deleteLog = async (id) => {
    await fetch(`http://localhost:5000/audit-logs/${id}`, {
      method: "DELETE",
    });

    toast.success("Log deleted");
    fetchLogs();
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.username.toLowerCase().includes(search.toLowerCase()) ||
      log.module.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">

      <div className="flex items-center gap-3 mb-8">
        <ClipboardList size={32} className="text-blue-600" />
        <h1 className="text-4xl font-bold">Audit Logs</h1>
      </div>

      <input
        type="text"
        placeholder="Search logs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-xl px-4 py-3 w-96 mb-6"
      />

      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Module</th>
              <th className="p-4 text-left">Action</th>
              <th className="p-4 text-left">Time</th>
              <th className="p-4 text-center">Delete</th>
            </tr>

          </thead>

          <tbody>

            {filteredLogs.length === 0 ? (

              <tr>
                <td
                  colSpan="5"
                  className="p-8 text-center text-gray-500"
                >
                  No Audit Logs
                </td>
              </tr>

            ) : (

              filteredLogs.map((log) => (

                <tr
                  key={log.id}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="p-4">{log.username}</td>

                  <td className="p-4">{log.module}</td>

                  <td className="p-4 font-medium">
                    {log.action}
                  </td>

                  <td className="p-4">
                    {new Date(log.created_at).toLocaleString()}
                  </td>

                  <td className="p-4 text-center">

                    <button
                      onClick={() => deleteLog(log.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}