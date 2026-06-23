import { useEffect, useState } from "react";

export default function Ledger() {
  const role = localStorage.getItem("role");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const addEntry = async () => {
    if (!form.amount || !form.description) return;

    await fetch("http://localhost:5000/ledger", {
      method: "POST",
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

    loadData();
  };

  const deleteEntry = async (id) => {
    await fetch(`http://localhost:5000/ledger/${id}`, {
      method: "DELETE",
    });
    loadData();
  };

  const total = entries.reduce(
    (sum, e) =>
      e.type === "Credit"
        ? sum + Number(e.amount)
        : sum - Number(e.amount),
    0
  );

  if (loading) return <h1>Loading...</h1>;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6">Ledger</h1>

      <div className="bg-blue-600 text-white p-5 rounded-xl mb-6">
        Net Balance: ₹{total}
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
            Add Entry
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">
          No ledger entries found
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl shadow p-4 flex justify-between"
            >
              <div>
                <p className="font-bold">{entry.type}</p>
                <p>₹{entry.amount}</p>
                <p>{entry.description}</p>
              </div>

              {(role === "admin" || role === "hr") && (
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="bg-red-500 text-white px-3 rounded"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}