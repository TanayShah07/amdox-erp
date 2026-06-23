import { useEffect, useState } from "react";

export default function Invoices() {
  const role = localStorage.getItem("role");
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({
    vendor_name: "",
    amount: "",
    status: "Pending",
    due_date: "",
  });

  const loadData = async () => {
    const res = await fetch("http://localhost:5000/invoices");
    const data = await res.json();
    setInvoices(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const addInvoice = async () => {
    await fetch("http://localhost:5000/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setForm({
      vendor_name: "",
      amount: "",
      status: "Pending",
      due_date: "",
    });

    loadData();
  };

  const deleteInvoice = async (id) => {
    await fetch(`http://localhost:5000/invoices/${id}`, {
      method: "DELETE",
    });
    loadData();
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6">Invoices</h1>

      {(role === "admin" || role === "hr") && (
        <div className="bg-white p-5 rounded-xl shadow mb-6 space-y-3">
          <input
            placeholder="Vendor Name"
            className="w-full border p-3 rounded"
            value={form.vendor_name}
            onChange={(e) =>
              setForm({
                ...form,
                vendor_name: e.target.value,
              })
            }
          />

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
            type="date"
            className="w-full border p-3 rounded"
            value={form.due_date}
            onChange={(e) =>
              setForm({ ...form, due_date: e.target.value })
            }
          />

          <button
            onClick={addInvoice}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            Add Invoice
          </button>
        </div>
      )}

      <div className="space-y-4">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="bg-white shadow rounded-xl p-5 flex justify-between"
          >
            <div>
              <h2 className="font-bold text-xl">
                {inv.vendor_name}
              </h2>
              <p>₹{inv.amount}</p>
              <p>Status: {inv.status}</p>
              <p>Due: {inv.due_date}</p>
            </div>

            {(role === "admin" || role === "hr") && (
              <button
                onClick={() => deleteInvoice(inv.id)}
                className="bg-red-500 text-white px-4 rounded"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}