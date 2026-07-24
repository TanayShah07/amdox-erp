import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function Ledger() {
  const role = localStorage.getItem("role");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    type: "Credit",
    amount: "",
    description: "",
    currency: "INR",
  });

  const loadData = async () => {
    try {
      const res = await fetch("http://localhost:5000/ledger");
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const addEntry = async () => {
    if (!form.amount || !form.description) return;

    const url = editId
      ? `http://localhost:5000/ledger/${editId}`
      : "http://localhost:5000/ledger";

    const method = editId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setForm({
      type: "Credit",
      amount: "",
      description: "",
      currency: "INR",
    });

    setEditId(null);

    loadData();
  };

  const deleteEntry = async (id) => {
    await fetch(`http://localhost:5000/ledger/${id}`, {
      method: "DELETE",
    });
    loadData();
  };

  const editEntry = (entry) => {
    setEditId(entry.id);

    setForm({
      type: entry.type,
      amount: entry.amount,
      description: entry.description,
      currency: entry.currency || "INR",
    });
  };

  const total = entries.reduce(
    (sum, e) =>
      e.type === "Credit"
        ? sum + Number(e.amount)
        : sum - Number(e.amount),
    0
  );

  const pieData = [
    {
      name: "Credit",
      value: entries.filter(e => e.type === "Credit").length,
    },
    {
      name: "Debit",
      value: entries.filter(e => e.type === "Debit").length,
    },
  ];

  const COLORS = ["#22c55e", "#ef4444"];

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const barData = months.map((month, index) => ({
    month,
    Credit: entries
      .filter(
        e =>
          e.type === "Credit" &&
          new Date(e.created_at).getMonth() === index
      )
      .reduce((sum, e) => sum + Number(e.amount), 0),

    Debit: entries
      .filter(
        e =>
          e.type === "Debit" &&
          new Date(e.created_at).getMonth() === index
      )
      .reduce((sum, e) => sum + Number(e.amount), 0),
  }));

  const chartData = [
  {
    name: "Credit",
    value: entries
      .filter((e) => e.type === "Credit")
      .reduce((sum, e) => sum + Number(e.amount), 0),
  },
  {
    name: "Debit",
    value: entries
      .filter((e) => e.type === "Debit")
      .reduce((sum, e) => sum + Number(e.amount), 0),
  },
];



  if (loading) return <h1>Loading...</h1>;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6">Ledger</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
      <div className="bg-white rounded-2xl shadow p-5">
        <p className="text-gray-500">Transactions</p>
        <h2 className="text-3xl font-bold text-blue-600">
          {entries.length}
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow p-5">
        <p className="text-gray-500">Credits</p>
        <h2 className="text-3xl font-bold text-green-600">
          {entries.filter(e=>e.type==="Credit").length}
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow p-5">
        <p className="text-gray-500">Debits</p>
        <h2 className="text-3xl font-bold text-red-600">
          {entries.filter(e=>e.type==="Debit").length}
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow p-5">
        <p className="text-gray-500">Net Balance</p>
        <h2 className="text-3xl font-bold text-purple-600">
          ₹{total}
        </h2>
      </div>

    </div>

    <div className="grid md:grid-cols-2 gap-6 mb-6">
      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="text-xl font-bold mb-4">
          Credit vs Debit
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              outerRadius={100}
              label
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="text-xl font-bold mb-4">
          Monthly Transactions
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar
              dataKey="Credit"
              fill="#22c55e"
            />

            <Bar
              dataKey="Debit"
              fill="#ef4444"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>

        {(role === "admin" || role === "hr") && (
        <div className="bg-white p-5 rounded-xl shadow mb-6 space-y-3">
          <select
            className="w-full border p-3 rounded"
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value })
            }
          >
            <option>Credit</option>
            <option>Debit</option>
          </select>

          

          <input
            placeholder="Amount"
            type="number"
            className="w-full border p-3 rounded"
            value={form.amount}
            onChange={(e) =>
              setForm({ ...form, amount: e.target.value })
            }
          />

          <input
            placeholder="Description"
            className="w-full border p-3 rounded"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />

          <button
            onClick={addEntry}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editId ? "Update Entry" : "Add Entry"}
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search Description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-3 rounded-xl w-80"
        />

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-3 rounded-xl"
        />

        {(role === "admin" || role === "hr") && (
          <>
            <a href="http://localhost:5000/reports/ledger/pdf">
              <button className="bg-red-500 text-white px-5 py-3 rounded-xl">
                Export PDF
              </button>
            </a>

            <a href="http://localhost:5000/reports/ledger/excel">
              <button className="bg-green-500 text-white px-5 py-3 rounded-xl">
                Export Excel
              </button>
            </a>
          </>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">
          No ledger entries found
        </div>
      ) : (
        <div className="space-y-3">
          {entries
  .filter((entry) => {
    const matchSearch = entry.description
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchDate =
      !selectedDate ||
      entry.created_at?.split("T")[0] === selectedDate;

    return matchSearch && matchDate;
  })
  .map((entry) => (
    <div
      key={entry.id}
      className="bg-white rounded-xl shadow p-4 flex justify-between items-center"
    >
      <div>
        <span
          className={`px-3 py-1 rounded-full text-white text-sm ${
            entry.type === "Credit"
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        >
          {entry.type}
        </span>

        <p className="mt-2 font-bold">
          ₹{Number(entry.amount).toLocaleString("en-IN")}
        </p>

        <p>{entry.description}</p>

        <p className="text-gray-500 text-sm">
          {entry.created_at?.split("T")[0]}
        </p>
      </div>

      {(role === "admin" || role === "hr") && (
        <div className="flex gap-2">
          <button
            onClick={() => editEntry(entry)}
            className="bg-blue-500 text-white px-3 py-2 rounded"
          >
            Edit
          </button>

          <button
            onClick={() => deleteEntry(entry.id)}
            className="bg-red-500 text-white px-3 py-2 rounded"
          >
            Delete
          </button>
        </div>
      )}
    </div>
))}
        </div>
      )}
    </div>
  );
}