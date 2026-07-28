import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Bell, CheckCircle, Trash2 } from "lucide-react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5000/notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    await fetch(`http://localhost:5000/notifications/${id}/read`, {
      method: "PUT",
    });

    fetchNotifications();
  };

  const deleteNotification = async (id) => {
    await fetch(`http://localhost:5000/notifications/${id}`, {
      method: "DELETE",
    });

    fetchNotifications();
  };

  return (
    <div className="p-8">

      <div className="flex items-center gap-3 mb-8">
        <Bell size={32} className="text-blue-600" />
        <h1 className="text-4xl font-bold">
          Notifications
        </h1>
      </div>

      {notifications.length === 0 ? (

        <div className="bg-white rounded-xl shadow p-10 text-center">

          <Bell size={60} className="mx-auto text-gray-400 mb-4" />

          <h2 className="text-xl font-semibold text-gray-700">
            No Notifications
          </h2>

          <p className="text-gray-500 mt-2">
            Everything is up to date.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {notifications.map((n) => (

            <div
              key={n.id}
              className={`rounded-xl shadow p-5 flex justify-between items-center ${
                n.is_read
                  ? "bg-gray-100"
                  : "bg-blue-50 border-l-4 border-blue-600"
              }`}
            >

              <div>

                <h2 className="text-lg font-bold">
                  {n.title}
                </h2>

                <p className="text-gray-600">
                  {n.message}
                </p>

                <p className="text-sm text-gray-400 mt-2">
                  {new Date(n.created_at).toLocaleString()}
                </p>

              </div>

              <div className="flex gap-3">

                {!n.is_read && (

                  <button
                    onClick={() => markRead(n.id)}
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg"
                  >
                    <CheckCircle size={18} />
                  </button>

                )}

                <button
                  onClick={() => deleteNotification(n.id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}