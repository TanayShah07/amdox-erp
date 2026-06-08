import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const role = localStorage.getItem("role");

  let menus = [];

  if (role === "employee") {
    menus = [
      {
        name: "Dashboard",
        path: "/dashboard",
      },
      {
        name: "My Projects",
        path: "/my-projects",
      },
      {
        name: "Leaves",
        path: "/leaves",
      },
      {
        name: "Profile",
        path: "/profile",
      },
    ];
  } else if (role === "hr") {
    menus = [
      {
        name: "Dashboard",
        path: "/dashboard",
      },
      {
        name: "Employees",
        path: "/employees",
      },
      {
        name: "Projects",
        path: "/projects",
      },
      {
        name: "Attendance",
        path: "/attendance",
      },
      {
        name: "Leaves",
        path: "/leaves",
      },
      {
        name: "Profile",
        path: "/profile",
      },
    ];
  } else {
    menus = [
      {
        name: "Dashboard",
        path: "/dashboard",
      },
      {
        name: "Employees",
        path: "/employees",
      },
      {
        name: "Projects",
        path: "/projects",
      },
      {
        name: "Attendance",
        path: "/attendance",
      },
      {
        name: "Leaves",
        path: "/leaves",
      },
      {
        name: "Payroll",
        path: "/payroll",
      },
      {
        name: "Profile",
        path: "/profile",
      },
    ];
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  return (
    <div className="hidden md:block w-64 bg-gray-900 text-white min-h-screen p-5 fixed left-0 top-0">
      <h1 className="text-3xl font-bold mb-10">
        ERP System
      </h1>

      <div className="flex flex-col gap-3">
        {menus.map((menu, index) => (
          <Link
            key={index}
            to={menu.path}
            className={`px-4 py-3 rounded-lg transition-all duration-200 ${
              location.pathname === menu.path
                ? "bg-blue-600"
                : "hover:bg-gray-700"
            }`}
          >
            {menu.name}
          </Link>
        ))}

        <button
          onClick={logout}
          className="mt-6 bg-red-500 hover:bg-red-600 px-4 py-3 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}