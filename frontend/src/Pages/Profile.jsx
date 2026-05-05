import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Profile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      const data = await res.json();

      setName(data.name || "");
      setEmail(data.email || "");
    } catch {
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const changePassword = async () => {
    const token = localStorage.getItem("token");

    if (!password || !newPassword) {
      alert("Fill both fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Password updated");
        setPassword("");
        setNewPassword("");
      } else {
        alert("Wrong password");
      }
    } catch {
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white p-8 rounded-xl shadow w-96">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-500"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">
          Profile
        </h2>

        <div className="mb-4">
          <p className="text-gray-500">Name</p>
          <p className="font-semibold">{name}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-500">Email</p>
          <p className="font-semibold">{email}</p>
        </div>

        <input
          type="password"
          placeholder="Current Password"
          className="w-full border p-3 rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="New Password"
          className="w-full border p-3 rounded mb-4"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button
          onClick={changePassword}
          className="w-full bg-blue-600 text-white py-3 rounded mb-3"
        >
          Change Password
        </button>

        <button
          onClick={logout}
          className="w-full bg-red-500 text-white py-3 rounded"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}