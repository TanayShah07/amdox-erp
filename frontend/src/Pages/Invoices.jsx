import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Invoices() {
  const role = localStorage.getItem("role");
  const [loading, setLoading] = useState(false);
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
    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/invoices"
      );

      const data = await res.json();

      setInvoices(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.log(err);
      toast.error("Failed to load invoices");
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

  const addInvoice = async () => {

    if (
      !form.invoice_number ||
      !form.vendor_name ||
      !form.amount ||
      !form.payment_method ||
      !form.due_date
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {

      const res = await fetch(
        "http://localhost:5000/invoices",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (data.success) {

        toast.success(data.message || "Invoice Added Successfully");

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

      } else {

        toast.error(data.message || "Failed to add invoice");

      }

    } catch (err) {

      console.log(err);

      toast.error("Server Error");

    }

  };

  const deleteInvoice = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (!confirmDelete) return;

    try {

      const res = await fetch(
        `http://localhost:5000/invoices/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (data.success) {

        toast.success(data.message || "Invoice Deleted");

        loadData();

      } else {

        toast.error(data.message || "Delete Failed");

      }

    } catch (err) {

      console.log(err);

      toast.error("Server Error");

    }

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

    if (
      !form.invoice_number ||
      !form.vendor_name ||
      !form.amount ||
      !form.payment_method ||
      !form.due_date
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {

      const res = await fetch(
        `http://localhost:5000/invoices/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (data.success) {

        toast.success(data.message || "Invoice Updated");

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

      } else {

        toast.error(data.message || "Update Failed");

      }

    } catch (err) {

      console.log(err);

      toast.error("Server Error");

    }

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
        <div className="bg-white rounded-2xl shadow p-6 mb-6">

          <h2 className="text-2xl font-bold mb-6">
            {editId ? "Update Invoice" : "Create New Invoice"}
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-semibold mb-2">
                Invoice Number
              </label>

              <input
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="INV-1001"
                value={form.invoice_number}
                onChange={(e)=>
                  setForm({
                    ...form,
                    invoice_number:e.target.value
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Vendor Name
              </label>

              <input
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="ABC Pvt Ltd"
                value={form.vendor_name}
                onChange={(e)=>
                  setForm({
                    ...form,
                    vendor_name:e.target.value
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Amount
              </label>

              <input
                type="number"
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="50000"
                value={form.amount}
                onChange={(e)=>
                  setForm({
                    ...form,
                    amount:e.target.value
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                GST Number
              </label>

              <input
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="29ABCDE1234F1Z5"
                value={form.gst_number}
                onChange={(e)=>
                  setForm({
                    ...form,
                    gst_number:e.target.value
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Payment Method
              </label>

              <select
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                value={form.payment_method}
                onChange={(e)=>
                  setForm({
                    ...form,
                    payment_method:e.target.value
                  })
                }
              >
                <option value="">Select</option>
                <option>Cash</option>
                <option>UPI</option>
                <option>Bank Transfer</option>
                <option>Cheque</option>
                <option>Credit Card</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Due Date
              </label>

              <input
                type="date"
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                value={form.due_date}
                onChange={(e)=>
                  setForm({
                    ...form,
                    due_date:e.target.value
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Status
              </label>

              <select
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                value={form.status}
                onChange={(e)=>
                  setForm({
                    ...form,
                    status:e.target.value
                  })
                }
              >
                <option>Pending</option>
                <option>Paid</option>
                <option>Overdue</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">
                Description
              </label>

              <textarea
                rows={4}
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Enter invoice description..."
                value={form.description}
                onChange={(e)=>
                  setForm({
                    ...form,
                    description:e.target.value
                  })
                }
              />
            </div>

          </div>

          <div className="flex gap-4 mt-6">

            <button
              onClick={editId ? updateInvoice : addInvoice}
              className={`px-6 py-3 rounded-xl text-white font-semibold transition ${
                editId
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {editId ? "Update Invoice" : "Add Invoice"}
            </button>

            {editId && (
              <button
                onClick={()=>{
                  setEditId(null);

                  setForm({
                    invoice_number:"",
                    vendor_name:"",
                    amount:"",
                    status:"Pending",
                    due_date:"",
                    payment_method:"",
                    gst_number:"",
                    description:"",
                  });
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl"
              >
                Cancel
              </button>
            )}

          </div>

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

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

        {invoices
        .filter((inv)=>{

        const matchVendor=
        inv.vendor_name
        ?.toLowerCase()
        .includes(search.toLowerCase());

        const matchStatus=
        statusFilter==="All"||
        inv.status===statusFilter;

        return matchVendor && matchStatus;

        })
        .sort((a,b)=>b.id-a.id)
        .map((inv)=>(

        <div
        key={inv.id}
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >

        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-5">

        <div className="flex justify-between items-center">

        <div>

        <h2 className="text-xl font-bold">
        {inv.invoice_number || `INV-${inv.id}`}
        </h2>

        <p className="text-sm opacity-90">
        {inv.vendor_name}
        </p>

        </div>

        <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${
        inv.status==="Paid"
        ?"bg-green-500"
        :inv.status==="Pending"
        ?"bg-yellow-500 text-black"
        :"bg-red-500"
        }`}
        >

        {inv.status}

        </span>

        </div>

        </div>

        <div className="p-5 space-y-3">

        <div className="flex justify-between">

        <span className="text-gray-500">
        Amount
        </span>

        <b className="text-green-600">
        ₹{Number(inv.amount).toLocaleString("en-IN")}
        </b>

        </div>

        <div className="flex justify-between">

        <span className="text-gray-500">
        GST
        </span>

        <b>
        {inv.gst_number || "-"}
        </b>

        </div>

        <div className="flex justify-between">

        <span className="text-gray-500">
        Payment
        </span>

        <b>
        {inv.payment_method || "-"}
        </b>

        </div>

        <div className="flex justify-between">

        <span className="text-gray-500">
        Due Date
        </span>

        <b>
        {inv.due_date?.split("T")[0]}
        </b>

        </div>

        <div>

        <p className="text-gray-500 mb-1">
        Description
        </p>

        <p className="text-gray-700 text-sm">
        {inv.description || "No Description"}
        </p>

        </div>

        {(role==="admin"||role==="hr") && (

        <div className="flex gap-3 pt-4">

        <button
        onClick={()=>editInvoice(inv)}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl"
        >

        Edit

        </button>

        <button
        onClick={()=>deleteInvoice(inv.id)}
        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl"
        >

        Delete

        </button>

        </div>

        )}

        </div>

        </div>

        ))}
      </div>
      )}
    </div>
  );
}