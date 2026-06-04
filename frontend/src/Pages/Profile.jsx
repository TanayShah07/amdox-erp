import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] =
    useState("");

  const [darkMode, setDarkMode] =
    useState(false);

  const [emailNotify, setEmailNotify] =
    useState(true);

  const [salaryNotify, setSalaryNotify] =
    useState(true);

  const [leaveNotify, setLeaveNotify] =
    useState(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
     const res = await fetch(
  "http://localhost:5000/api/user/profile",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

     if (res.status === 401) {
  localStorage.removeItem("token");
  navigate("/");
  return;
}

if (!res.ok) {
  console.error("Server error:", res.status);
  return;
}

      const data = await res.json();

      setUser(data.user);

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
      const res = await fetch(
        "http://localhost:5000/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            password,
            newPassword,
          }),
        }
      );

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

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-6xl mx-auto">

        {/* TOP BAR */}

        <div className="flex justify-between items-center mb-6">

          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 font-medium"
          >
            ← Back
          </button>

          <h1 className="text-4xl font-bold">
            Settings Dashboard
          </h1>

        </div>

        {/* PROFILE CARD */}

        <div
          className={`rounded-2xl p-6 shadow-lg mb-6 ${
            darkMode
              ? "bg-gray-800"
              : "bg-white"
          }`}
        >

          <div className="flex items-center gap-6">

            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-4xl text-white font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <div>

              <h2 className="text-3xl font-bold">
                {user.name}
              </h2>

              <p className="text-gray-500">
                {user.email}
              </p>

              <p className="mt-2">
                Employee ID:
                <span className="font-bold ml-2">
                  {user.employee_code || "N/A"}
                </span>
              </p>

              <p>
                Role:
                <span className="font-bold ml-2 uppercase">
                  {user.role}
                </span>
              </p>

            </div>
          </div>
        </div>

        {/* STATS */}

        <div className="grid md:grid-cols-4 gap-4 mb-6">

          <div className="bg-blue-500 text-white p-6 rounded-2xl shadow">
            <h3 className="text-lg">
              Attendance
            </h3>

            <p className="text-3xl font-bold">
              92%
            </p>
          </div>

          <div className="bg-green-500 text-white p-6 rounded-2xl shadow">
            <h3 className="text-lg">
              Leaves
            </h3>

            <p className="text-3xl font-bold">
              12
            </p>
          </div>

          <div className="bg-yellow-500 text-white p-6 rounded-2xl shadow">
            <h3 className="text-lg">
              Projects
            </h3>

            <p className="text-3xl font-bold">
              5
            </p>
          </div>

          <div className="bg-purple-500 text-white p-6 rounded-2xl shadow">
            <h3 className="text-lg">
              Salary
            </h3>

            <p className="text-3xl font-bold">
              ₹80K
            </p>
          </div>

        </div>

        {/* SECURITY */}

        <div
          className={`rounded-2xl p-6 shadow-lg mb-6 ${
            darkMode
              ? "bg-gray-800"
              : "bg-white"
          }`}
        >

          <h2 className="text-2xl font-bold mb-4">
            Security
          </h2>

          <input
            type="password"
            placeholder="Current Password"
            className="w-full border p-3 rounded-lg mb-4 text-black"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="New Password"
            className="w-full border p-3 rounded-lg mb-4 text-black"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
          />

          <button
            onClick={changePassword}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Change Password
          </button>

        </div>

        {/* APPEARANCE */}

        <div
          className={`rounded-2xl p-6 shadow-lg mb-6 ${
            darkMode
              ? "bg-gray-800"
              : "bg-white"
          }`}
        >

          <h2 className="text-2xl font-bold mb-4">
            Appearance
          </h2>

          <div className="flex items-center justify-between">

            <p>Dark Mode</p>

            <button
              onClick={() =>
                setDarkMode(!darkMode)
              }
              className={`px-6 py-2 rounded-full text-white ${
                darkMode
                  ? "bg-green-500"
                  : "bg-gray-500"
              }`}
            >
              {darkMode ? "ON" : "OFF"}
            </button>

          </div>
        </div>

        {/* NOTIFICATIONS */}

        <div
          className={`rounded-2xl p-6 shadow-lg mb-6 ${
            darkMode
              ? "bg-gray-800"
              : "bg-white"
          }`}
        >

          <h2 className="text-2xl font-bold mb-4">
            Notifications
          </h2>

          <div className="space-y-4">

            <div className="flex justify-between">
              <p>Email Notifications</p>

              <input
                type="checkbox"
                checked={emailNotify}
                onChange={() =>
                  setEmailNotify(!emailNotify)
                }
              />
            </div>

            <div className="flex justify-between">
              <p>Salary Notifications</p>

              <input
                type="checkbox"
                checked={salaryNotify}
                onChange={() =>
                  setSalaryNotify(
                    !salaryNotify
                  )
                }
              />
            </div>

            <div className="flex justify-between">
              <p>Leave Notifications</p>

              <input
                type="checkbox"
                checked={leaveNotify}
                onChange={() =>
                  setLeaveNotify(!leaveNotify)
                }
              />
            </div>

          </div>
        </div>

        {/* ACTIVITY */}

        <div
          className={`rounded-2xl p-6 shadow-lg mb-6 ${
            darkMode
              ? "bg-gray-800"
              : "bg-white"
          }`}
        >

          <h2 className="text-2xl font-bold mb-4">
            Recent Activity
          </h2>

          <ul className="space-y-3">

            <li>
              ✅ Attendance marked today
            </li>

            <li>
              ✅ Leave applied successfully
            </li>

            <li>
              ✅ Payroll generated
            </li>

          </ul>
        </div>

        {/* DANGER ZONE */}

        <div className="bg-red-100 border border-red-300 p-6 rounded-2xl">

          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Danger Zone
          </h2>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg"
          >
            Sign Out
          </button>

        </div>
      </div>
    </div>
  );
}