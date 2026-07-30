import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Inventory() {
  const role = localStorage.getItem("role");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({    
    item_name: "",
    category: "",
    quantity: "",
    unit_price: "",
    supplier: "",
    reorder_level: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:5000/inventory"
      );
      const data = await res.json();
      setItems(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.log(err);
      toast.error("Failed to load inventory");
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

    const addItem = async () => {
      if (
        !form.item_name ||
        !form.category ||
        !form.quantity ||
        !form.unit_price ||
        !form.supplier ||
        !form.reorder_level
      ) {
        toast.error("Please fill all fields");
        return;
      }
      try {
        const res = await fetch(
          "http://localhost:5000/inventory",
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
          toast.success(data.message);
          setForm({
            item_name: "",
            category: "",
            quantity: "",
            unit_price: "",
            supplier: "",
            reorder_level: "",
          });
          loadData();
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        console.log(err);
        toast.error("Server Error");
      }
    };


  const deleteItem = async (id) => {
    if (!window.confirm("Delete this inventory item?")) {
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/inventory/${id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
      loadData();
    } catch (err) {
      toast.error("Delete Failed");
    }
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
    if (
      !form.item_name ||
      !form.category ||
      !form.quantity ||
      !form.unit_price ||
      !form.supplier ||
      !form.reorder_level
    ) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/inventory/${editId}`,
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
        toast.success(data.message);
        setEditId(null);
        setForm({
          item_name: "",
          category: "",
          quantity: "",
          unit_price: "",
          supplier: "",
          reorder_level: "",
        });
        loadData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Update Failed");
    }
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

      <div className="flex gap-3 mb-5">

        <a href="http://localhost:5000/reports/inventory/pdf">
          <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl">
            Export PDF
          </button>
        </a>

        <a href="http://localhost:5000/reports/inventory/excel">
          <button className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl">
            Export Excel
          </button>
        </a>

      </div>

      <div className="flex gap-4 mb-6">

        <input
        type="text"
        placeholder="Search Item..."
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        className="border p-3 rounded-xl w-80"
        />

        <select
        value={categoryFilter}
        onChange={(e)=>setCategoryFilter(e.target.value)}
        className="border p-3 rounded-xl"
        >

        <option>All</option>

        <option>Electronics</option>

        <option>Hardware</option>

        <option>Stationery</option>

        <option>Furniture</option>

        <option>Software</option>

        <option>Others</option>

        </select>

        </div>



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

      {loading ? (

        <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
          Loading Inventory...
        </div>

      ) : (

        <div className="grid md:grid-cols-3 gap-4">

          {items
            .filter((item) => {

              const matchSearch =
                item.item_name
                  ?.toLowerCase()
                  .includes(search.toLowerCase());

              const matchCategory =
                categoryFilter === "All" ||
                item.category === categoryFilter;

              return matchSearch && matchCategory;

            })
            .map((item) => (

              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >

                <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-5 text-white">

                  <h2 className="text-2xl font-bold">
                    {item.item_name}
                  </h2>

                  <p className="opacity-90">
                    {item.category}
                  </p>

                </div>


                <div className="p-5">

                  <div className="space-y-2 text-gray-700">

                    <p>
                      <b>Supplier :</b> {item.supplier}
                    </p>

                    <p>
                      <b>Unit Price :</b>
                      ₹{Number(item.unit_price).toLocaleString("en-IN")}
                    </p>

                    <p>
                      <b>Stock :</b> {item.quantity}
                    </p>

                    <p>
                      <b>Reorder Level :</b> {item.reorder_level}
                    </p>

                    <p>
                      <b>Total Value :</b>
                      ₹{(
                        Number(item.quantity || 0) *
                        Number(item.unit_price || 0)
                      ).toLocaleString("en-IN")}
                    </p>

                  </div>


                  <div className="mt-5">

                    <span
                      className={`px-4 py-2 rounded-full text-white text-sm font-semibold ${
                        Number(item.quantity) === 0
                          ? "bg-red-600"
                          : Number(item.quantity) <= Number(item.reorder_level)
                          ? "bg-yellow-500"
                          : "bg-green-600"
                      }`}
                    >

                      {
                        Number(item.quantity) === 0
                          ? "❌ Out Of Stock"
                          : Number(item.quantity) <= Number(item.reorder_level)
                          ? "⚠ Low Stock"
                          : "✅ In Stock"
                      }

                    </span>

                  </div>


                  {(role === "admin" || role === "hr") && (

                    <div className="mt-6 flex gap-3">

                      <button
                        onClick={() => editItem(item)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl"
                      >
                        Edit
                      </button>


                      <button
                        onClick={() => deleteItem(item.id)}
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