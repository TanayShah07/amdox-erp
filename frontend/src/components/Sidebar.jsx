import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const role = localStorage.getItem("role");

  let menus = [];

  if (role === "employee") {
    menus = [
      { name: "Dashboard", path: "/dashboard" },
      { name: "My Projects", path: "/my-projects" },
      { name: "Attendance", path: "/attendance" },
      { name: "Leaves", path: "/leaves" },
      { name: "Profile", path: "/profile" },
    ];
  } else if (role === "hr") {
    menus = [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Employees", path: "/employees" },
      { name: "Projects", path: "/projects" },
      { name: "Attendance", path: "/attendance" },
      { name: "Leaves", path: "/leaves" },
      { name: "Ledger", path: "/ledger" },
      { name: "Inventory", path: "/inventory" },
      { name: "Invoices", path: "/invoices" },
      { name: "Profile", path: "/profile" },
    ];
  } else {
    menus = [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Employees", path: "/employees" },
      { name: "Projects", path: "/projects" },
      { name: "Attendance", path: "/attendance" },
      { name: "Leaves", path: "/leaves" },
      { name: "Payroll", path: "/payroll" },
      { name: "Ledger", path: "/ledger" },
      { name: "Inventory", path: "/inventory" },
      { name: "Invoices", path: "/invoices" },
      { name: "Profile", path: "/profile" },
    ];
  }

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="hidden md:flex flex-col w-72 bg-slate-900 text-white h-screen fixed left-0 top-0 shadow-xl">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold tracking-wide">
          ERP System
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Management Portal
        </p>
      </div>

      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menus.map((menu, index) => (
          <Link
            key={index}
            to={menu.path}
            className={`block px-4 py-3 rounded-xl transition-all duration-300 ${
              location.pathname === menu.path
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {menu.name}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={logout}
          className="w-full bg-red-500 hover:bg-red-600 py-3 rounded-xl font-medium transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}