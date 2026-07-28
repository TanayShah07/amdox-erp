import { useEffect, useState } from "react";

export default function PurchaseOrders() {

  const role = localStorage.getItem("role");

  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    po_number: "",
    vendor_name: "",
    item_name: "",
    quantity: "",
    unit_price: "",
    total_amount: "",
    order_date: "",
    expected_delivery: "",
    status: "Pending",
    remarks: "",
  });

  const loadData = async () => {
    const res = await fetch("http://localhost:5000/purchase-orders");
    const data = await res.json();

    setOrders(Array.isArray(data) ? data : []);
  };

  useEffect(() => {

    loadData();

    const interval = setInterval(loadData,30000);

    return () => clearInterval(interval);

  }, []);

  useEffect(() => {

    const total =
      Number(form.quantity || 0) *
      Number(form.unit_price || 0);

    setForm((prev)=>({
      ...prev,
      total_amount: total,
    }));

  },[form.quantity,form.unit_price]);

  const clearForm = () => {

    setEditId(null);

    setForm({
      po_number:"",
      vendor_name:"",
      item_name:"",
      quantity:"",
      unit_price:"",
      total_amount:"",
      order_date:"",
      expected_delivery:"",
      status:"Pending",
      remarks:"",
    });

  };

  const addOrder = async () => {

    await fetch("http://localhost:5000/purchase-orders",{

      method:"POST",

      headers:{
        "Content-Type":"application/json",
      },

      body:JSON.stringify(form),

    });

    clearForm();

    loadData();

  };

  const updateOrder = async () => {

    await fetch(`http://localhost:5000/purchase-orders/${editId}`,{

      method:"PUT",

      headers:{
        "Content-Type":"application/json",
      },

      body:JSON.stringify(form),

    });

    clearForm();

    loadData();

  };

  const deleteOrder = async(id)=>{

    await fetch(`http://localhost:5000/purchase-orders/${id}`,{

      method:"DELETE",

    });

    loadData();

  };

  const editOrder=(order)=>{

    setEditId(order.id);

    setForm({

      po_number:order.po_number || "",

      vendor_name:order.vendor_name || "",

      item_name:order.item_name || "",

      quantity:order.quantity || "",

      unit_price:order.unit_price || "",

      total_amount:order.total_amount || "",

      order_date:order.order_date?.split("T")[0] || "",

      expected_delivery:
      order.expected_delivery?.split("T")[0] || "",

      status:order.status || "Pending",

      remarks:order.remarks || "",

    });

  };

  return (

<div className="p-8">

<h1 className="text-4xl font-bold mb-6">
Purchase Orders
</h1>

<div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

<div className="bg-white rounded-xl shadow p-5">
<p>Total Orders</p>

<h2 className="text-3xl font-bold text-blue-600">
{orders.length}
</h2>
</div>

<div className="bg-white rounded-xl shadow p-5">
<p>Pending</p>

<h2 className="text-3xl font-bold text-yellow-600">
{
orders.filter(
o=>o.status==="Pending"
).length
}
</h2>
</div>

<div className="bg-white rounded-xl shadow p-5">
<p>Completed</p>

<h2 className="text-3xl font-bold text-green-600">
{
orders.filter(
o=>o.status==="Completed"
).length
}
</h2>
</div>

<div className="bg-white rounded-xl shadow p-5">
<p>Total Value</p>

<h2 className="text-2xl font-bold text-purple-600">

₹{
orders
.reduce(
(sum,o)=>sum+Number(o.total_amount||0),
0
)
.toLocaleString("en-IN")
}

</h2>

</div>

</div>

{
(role==="admin" || role==="hr") && (

<div className="bg-white rounded-xl shadow p-5 mb-8 space-y-3">

    

<input
className="w-full border p-3 rounded"
placeholder="PO Number"
value={form.po_number}
onChange={(e)=>setForm({...form,po_number:e.target.value})}
/>

<input
className="w-full border p-3 rounded"
placeholder="Vendor Name"
value={form.vendor_name}
onChange={(e)=>setForm({...form,vendor_name:e.target.value})}
/>

<input
className="w-full border p-3 rounded"
placeholder="Item Name"
value={form.item_name}
onChange={(e)=>setForm({...form,item_name:e.target.value})}
/>

<input
type="number"
className="w-full border p-3 rounded"
placeholder="Quantity"
value={form.quantity}
onChange={(e)=>setForm({...form,quantity:e.target.value})}
/>

<input
type="number"
className="w-full border p-3 rounded"
placeholder="Unit Price"
value={form.unit_price}
onChange={(e)=>setForm({...form,unit_price:e.target.value})}
/>

<input
readOnly
className="w-full border p-3 rounded bg-gray-100"
value={form.total_amount}
/>

<input
type="date"
className="w-full border p-3 rounded"
value={form.order_date}
onChange={(e)=>setForm({...form,order_date:e.target.value})}
/>

<input
type="date"
className="w-full border p-3 rounded"
value={form.expected_delivery}
onChange={(e)=>setForm({...form,expected_delivery:e.target.value})}
/>

<select
className="w-full border p-3 rounded"
value={form.status}
onChange={(e)=>setForm({...form,status:e.target.value})}
>
<option>Pending</option>
<option>Completed</option>
<option>Cancelled</option>
</select>

<textarea
className="w-full border p-3 rounded"
placeholder="Remarks"
value={form.remarks}
onChange={(e)=>setForm({...form,remarks:e.target.value})}
/>

<button
onClick={editId ? updateOrder : addOrder}
className={`text-white px-5 py-2 rounded ${
editId
? "bg-blue-600"
: "bg-purple-600"
}`}
>

{editId ? "Update Order" : "Add Order"}

</button>

</div>

)
}

<div className="flex gap-3 mb-5">

<a href="http://localhost:5000/purchase-orders/pdf">

<button className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl">

Export PDF

</button>

</a>

<a href="http://localhost:5000/purchase-orders/excel">

<button className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl">

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
    <option>Pending</option>
    <option>Completed</option>
    <option>Cancelled</option>
  </select>

</div>

{
orders.length===0 ?

(

<div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">

No Purchase Orders Found

</div>

)

:

(

<div className="space-y-4">

{

orders

.filter((order)=>{

const matchVendor=

order.vendor_name

?.toLowerCase()

.includes(search.toLowerCase());

const matchStatus=

statusFilter==="All"

||

order.status===statusFilter;

return matchVendor && matchStatus;

})

.map((order)=>(

<div
key={order.id}
className="bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 p-5 flex justify-between"
>

<div>

<h2 className="font-bold text-xl">

{order.po_number}

</h2>

<p>

<b>Vendor :</b> {order.vendor_name}

</p>

<p>

<b>Item :</b> {order.item_name}

</p>

<p>

<b>Quantity :</b> {order.quantity}

</p>

<p>

<b>Unit Price :</b>

₹{Number(order.unit_price).toLocaleString("en-IN")}

</p>

<p>

<b>Total :</b>

₹{Number(order.total_amount).toLocaleString("en-IN")}

</p>

<p>

<b>Order Date :</b>

{order.order_date?.split("T")[0]}

</p>

<p>

<b>Expected Delivery :</b>

{order.expected_delivery?.split("T")[0]}

</p>

<p>

<b>Remarks :</b>

{order.remarks}

</p>

<span
className={`px-3 py-1 rounded-full text-white text-sm

${

order.status==="Completed"

?

"bg-green-500"

:

order.status==="Pending"

?

"bg-yellow-500"

:

"bg-red-500"

}

`}
>

{

order.status==="Completed"

?

"✅ Completed"

:

order.status==="Pending"

?

"⏳ Pending"

:

"❌ Cancelled"

}

</span>

</div>

{

(role==="admin" || role==="hr") && (

<div className="flex flex-col gap-2">

<button

onClick={()=>editOrder(order)}

className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"

>

Edit

</button>

<button

onClick={()=>deleteOrder(order.id)}

className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"

>

Delete

</button>

</div>

)

}

</div>

))

}

</div>

)

}

</div>

);

}