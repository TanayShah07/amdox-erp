import { useEffect, useState } from "react";

export default function Invoices() {
  const role = localStorage.getItem("role");
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({
    invoice_number: "",
    vendor_name: "",
    amount: "",
    status: "Pending",
    due_date: "",
    payment_method: "",
    gst_number: "",
    description: "",
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editId, setEditId] = useState(null);

  const loadData = async () => {
    const res = await fetch("http://localhost:5000/invoices");
    const data = await res.json();
    setInvoices(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
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
      invoice_number: "",
      vendor_name: "",
      amount: "",
      status: "Pending",
      due_date: "",
      payment_method: "",
      gst_number: "",
      description: "",
    });

    loadData();
  };

  const deleteInvoice = async (id) => {
    await fetch(`http://localhost:5000/invoices/${id}`, {
      method: "DELETE",
    });
    loadData();
  };

  const editInvoice = (inv) => {
    setEditId(inv.id);

    setForm({
      invoice_number: inv.invoice_number || "",
      vendor_name: inv.vendor_name || "",
      amount: inv.amount || "",
      status: inv.status || "Pending",
      due_date: inv.due_date?.split("T")[0] || "",
      payment_method: inv.payment_method || "",
      gst_number: inv.gst_number || "",
      description: inv.description || "",
    });
  };

  const updateInvoice = async () => {
    await fetch(`http://localhost:5000/invoices/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setEditId(null);

    setForm({
      invoice_number: "",
      vendor_name: "",
      amount: "",
      status: "Pending",
      due_date: "",
      payment_method: "",
      gst_number: "",
      description: "",
    });

    loadData();
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6">Invoices</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500">Total Invoices</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {invoices.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500">Paid</p>
          <h2 className="text-3xl font-bold text-green-600">
            {invoices.filter(i=>i.status==="Paid").length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500">Pending</p>
          <h2 className="text-3xl font-bold text-yellow-600">
            {invoices.filter(i=>i.status==="Pending").length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500">Invoice Value</p>
          <h2 className="text-3xl font-bold text-purple-600">
            ₹{invoices
              .reduce((sum,i)=>sum+Number(i.amount||0),0)
              .toLocaleString("en-IN")}
          </h2>
        </div>

      </div>

      {(role === "admin" || role === "hr") && (
        <div className="bg-white p-5 rounded-xl shadow mb-6 space-y-3">
         
          <input
            placeholder="Invoice Number"
            className="w-full border p-3 rounded"
            value={form.invoice_number}
            onChange={(e)=>
              setForm({...form,invoice_number:e.target.value})
            }
          />

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
            placeholder="GST Number"
            className="w-full border p-3 rounded"
            value={form.gst_number}
            onChange={(e)=>
              setForm({...form,gst_number:e.target.value})
            }
          />

          <input
            placeholder="Payment Method"
            className="w-full border p-3 rounded"
            value={form.payment_method}
            onChange={(e)=>
              setForm({...form,payment_method:e.target.value})
            }
          />

          <textarea
            placeholder="Description"
            className="w-full border p-3 rounded"
            value={form.description}
            onChange={(e)=>
              setForm({...form,description:e.target.value})
            }
          />

          <select
            className="w-full border p-3 rounded"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
          >
            <option>Pending</option>
            <option>Paid</option>
            <option>Overdue</option>
          </select>

          <input
            type="date"
            className="w-full border p-3 rounded"
            value={form.due_date}
            onChange={(e) =>
              setForm({ ...form, due_date: e.target.value })
            }
          />

          <button
            onClick={editId ? updateInvoice : addInvoice}
            className={`text-white px-4 py-2 rounded ${
              editId
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {editId ? "Update Invoice" : "Add Invoice"}
          </button>

          {editId && (
            <button
              onClick={() => {

                setEditId(null);

                setForm({
                  invoice_number: "",
                  vendor_name: "",
                  amount: "",
                  status: "Pending",
                  due_date: "",
                  payment_method: "",
                  gst_number: "",
                  description: "",
                });

              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      )}

       <div className="flex gap-3 mb-5">

        <a href="http://localhost:5000/reports/invoices/pdf">
        <button className="bg-red-500 text-white px-5 py-2 rounded-xl">
        Export PDF
        </button>
        </a>

        <a href="http://localhost:5000/reports/invoices/excel">
        <button className="bg-green-500 text-white px-5 py-2 rounded-xl">
        Export Excel
        </button>
        </a>
 
      </div>

      

      <div className="flex gap-4 mb-6">

        <input
          type="text"
          placeholder="Search Vendor..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="border p-3 rounded-xl w-80"
        />

        <select
          value={statusFilter}
          onChange={(e)=>setStatusFilter(e.target.value)}
          className="border p-3 rounded-xl"
        >
          <option>All</option>
          <option>Paid</option>
          <option>Pending</option>
          <option>Overdue</option>
        </select>

      </div>
      

      {invoices.length === 0 ? (

      <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
      No invoices found
      </div>

      ) : (

      <div className="space-y-4">
        {invoices
          .filter((inv) => {

            const matchVendor =
              inv.vendor_name
                ?.toLowerCase()
                .includes(search.toLowerCase());

            const matchStatus =
              statusFilter === "All" ||
              inv.status === statusFilter;

            return matchVendor && matchStatus;

          })
          .map((inv) => (

          <div
            key={inv.id}
            className="bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 p-5 flex justify-between"
          >
            <div>
              <h2 className="font-bold text-xl">
                {inv.invoice_number || `INV-${inv.id}`}
              </h2>

              <p>
                <b>Vendor :</b> {inv.vendor_name}
              </p>

              <p>
                <b>Amount :</b> ₹{Number(inv.amount).toLocaleString("en-IN")}
              </p>

              <p>
                <b>GST :</b> {inv.gst_number}
              </p>

              <p>
                <b>Payment :</b> {inv.payment_method}
              </p>

              <p>
                <b>Due :</b> {inv.due_date?.split("T")[0]}
              </p>

              <p>
                <b>Description :</b> {inv.description}
              </p>

                            <span
                className={`px-3 py-1 rounded-full text-white text-sm ${
                  inv.status === "Paid"
                    ? "bg-green-500"
                    : inv.status === "Pending"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              >
                {inv.status === "Paid"
                  ? "✅ Paid"
                  : inv.status === "Pending"
                  ? "⏳ Pending"
                  : "❌ Overdue"}
              </span>
            </div>

            {(role === "admin" || role === "hr") && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => editInvoice(inv)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteInvoice(inv.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
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