import { useEffect, useState } from "react";

export default function Inventory() {
  const role = localStorage.getItem("role");
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [editId,setEditId]=useState(null);

  const [form, setForm] = useState({    
    item_name: "",
    category: "",
    quantity: "",
    unit_price: "",
    supplier: "",
    reorder_level: "",
  });

  const loadData = async () => {
    const res = await fetch("http://localhost:5000/inventory");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

    useEffect(() => {
      loadData();

      const interval = setInterval(() => {
        loadData();
      }, 30000);

      return () => clearInterval(interval);
    }, []);

    const addItem = async () => {
      await fetch(
        "http://localhost:5000/inventory",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json",
          },
          body:JSON.stringify(form),
        }
      );

      setForm({
        item_name:"",
        category:"",
        quantity:"",
        unit_price:"",
        supplier:"",
        reorder_level:"",
      });

      loadData();
    };


  const deleteItem = async (id) => {
    await fetch(`http://localhost:5000/inventory/${id}`, {
      method: "DELETE",
    });
    loadData();
  };

  const editItem = (item) => {
    setEditId(item.id);

    setForm({
      item_name: item.item_name,
      category: item.category,
      quantity: item.quantity,
      unit_price: item.unit_price,
      supplier: item.supplier,
      reorder_level: item.reorder_level,
    });
  };

  const updateItem = async () => {
    await fetch(
    `http://localhost:5000/inventory/${editId}`,
    {
      method:"PUT",
      headers:{
      "Content-Type":"application/json"
      },
      body:JSON.stringify(form)
    });

    setEditId(null);

    setForm({
      item_name:"",
      category:"",
      quantity:"",
      unit_price:"",
      supplier:"",
      reorder_level:"",
    });


    await loadData();

    };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6">Inventory</h1>

      {(role === "admin" || role === "hr") && (
        <div className="bg-white p-5 rounded-xl shadow mb-6 space-y-3">
          <input
            placeholder="Item Name"
            className="w-full border p-3 rounded"
            value={form.item_name}
            onChange={(e) =>
              setForm({ ...form, item_name: e.target.value })
            }
          />

          <input
            placeholder="Quantity"
            type="number"
            className="w-full border p-3 rounded"
            value={form.quantity}
            onChange={(e) =>
              setForm({ ...form, quantity: e.target.value })
            }
          />


          <input
            placeholder="Reorder Level"
            type="number"
            className="w-full border p-3 rounded"
            value={form.reorder_level}
            onChange={(e) =>
              setForm({
                ...form,
                reorder_level: e.target.value,
              })
            }
          />

                <input
                placeholder="Category"
                className="w-full border p-3 rounded"
                value={form.category}
                onChange={(e)=>
                setForm({...form,category:e.target.value})
                }
                />

                <input
                placeholder="Unit Price"
                type="number"
                min="0"
                required
                className="w-full border p-3 rounded"
                value={form.unit_price}
                onChange={(e)=>
                setForm({...form,unit_price:e.target.value})
                }
                />

                <input
                placeholder="Supplier"
                className="w-full border p-3 rounded"
                value={form.supplier}
                onChange={(e)=>
                setForm({...form,supplier:e.target.value})
                }
                />

          <button
            onClick={editId ? updateItem : addItem}
            className={`text-white px-4 py-2 rounded ${
              editId
                ? "bg-blue-600"
                : "bg-green-600"
            }`}
          >
            {editId ? "Update Item" : "Add Item"}
          </button>
        </div>
      )}

      <input
        type="text"
        placeholder="Search Item..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-3 rounded-xl w-80 mb-5"
      />



      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500">Total Items</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {items.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500">Low Stock</p>
          <h2 className="text-3xl font-bold text-yellow-600">
            {
              items.filter(
                i => Number(i.quantity) <= Number(i.reorder_level)
              ).length
            }
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500">Available</p>
          <h2 className="text-3xl font-bold text-green-600">
            {
              items.filter(i => Number(i.quantity) > 0).length
            }
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500">Inventory Value</p>
          <h2 className="text-3xl font-bold text-purple-600">
            ₹{
              items
                .reduce(
                  (sum, i) =>
                    sum +
                    Number(i.quantity || 0) *
                    Number(i.unit_price || 0),
                  0
                )
                .toLocaleString("en-IN")
            }
          </h2>
        </div>

      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {items.filter((item) =>
            item.item_name
              ?.toLowerCase()
              .includes(search.toLowerCase())
          )
          .map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow p-5">
            <h2 className="font-bold text-xl">{item.item_name}</h2>
            <p>Category : {item.category}</p>
            <p>Supplier : {item.supplier}</p>
            <p>Unit Price : ₹ {item.unit_price}</p>
            <p>Stock : {item.quantity}</p>
            <p>Reorder : {item.reorder_level}</p>
            <p>Total Value : ₹ {
              (Number(item.quantity || 0) * Number(item.unit_price || 0))
              .toLocaleString("en-IN")}
            </p>

            <span
              className={`px-3 py-1 rounded-full text-white text-sm ${
              Number(item.quantity)==0
              ? "bg-red-500"
              : Number(item.quantity)<=Number(item.reorder_level)
              ? "bg-yellow-500"
              : "bg-green-500"
              }`}
              >
              {
              Number(item.quantity)==0
              ? "Out Of Stock"
              : Number(item.quantity)<=Number(item.reorder_level)
              ? "Low Stock"
              : "Available"
              }
            </span>

            {(role === "admin" || role === "hr") && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => deleteItem(item.id)}
                  className="bg-red-500 text-white px-3 py-2 rounded"
                >
                  Delete
                </button>

                <button
                  onClick={() => editItem(item)}
                  className="bg-blue-500 text-white px-3 py-2 rounded"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}