import { useEffect, useState } from "react";

export default function Inventory() {
  const role = localStorage.getItem("role");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    item_name: "",
    quantity: "",
    reorder_level: "",
  });

  const loadData = async () => {
    const res = await fetch("http://localhost:5000/inventory");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const addItem = async () => {
    await fetch("http://localhost:5000/inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setForm({
      item_name: "",
      quantity: "",
      reorder_level: "",
    });

    loadData();
  };

  const deleteItem = async (id) => {
    await fetch(`http://localhost:5000/inventory/${id}`, {
      method: "DELETE",
    });
    loadData();
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

          <button
            onClick={addItem}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Add Item
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow p-5">
            <h2 className="font-bold text-xl">{item.item_name}</h2>
            <p>Stock: {item.quantity}</p>
            <p>Reorder: {item.reorder_level}</p>

            {item.quantity <= item.reorder_level && (
              <p className="text-red-500 font-bold mt-2">
                Low Stock ⚠️
              </p>
            )}

            {(role === "admin" || role === "hr") && (
              <button
                onClick={() => deleteItem(item.id)}
                className="mt-3 bg-red-500 text-white px-3 py-2 rounded"
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