import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CalendarCheck,
  FileText,
  Wallet,
  Package,
  Receipt,
  User,
  LogOut,
  ClipboardList,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const role = localStorage.getItem("role") || "employee";

  const menuConfig = {
    employee: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "My Projects",
        path: "/my-projects",
        icon: FolderKanban,
      },
      {
        name: "Attendance",
        path: "/attendance",
        icon: CalendarCheck,
      },
      {
        name: "Leaves",
        path: "/leaves",
        icon: FileText,
      },
      {
        name: "Profile",
        path: "/profile",
        icon: User,
      },
    ],

    hr: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Employees",
        path: "/employees",
        icon: Users,
      },
      {
        name: "Projects",
        path: "/projects",
        icon: FolderKanban,
      },
      {
        name: "Attendance",
        path: "/attendance",
        icon: CalendarCheck,
      },
      {
        name: "Leaves",
        path: "/leaves",
        icon: FileText,
      },
      {
        name: "Ledger",
        path: "/ledger",
        icon: Wallet,
      },
      {
        name: "Inventory",
        path: "/inventory",
        icon: Package,
      },
      {
        name: "Invoices",
        path: "/invoices",
        icon: Receipt,
      },
      {
        name: "Profile",
        path: "/profile",
        icon: User,
      },
    ],

    admin: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Employees",
        path: "/employees",
        icon: Users,
      },
      {
        name: "Projects",
        path: "/projects",
        icon: FolderKanban,
      },
      {
        name: "Attendance",
        path: "/attendance",
        icon: CalendarCheck,
      },
      {
        name: "Leaves",
        path: "/leaves",
        icon: FileText,
      },
      {
        name: "Payroll",
        path: "/payroll",
        icon: Wallet,
      },
      {
        name: "Ledger",
        path: "/ledger",
        icon: ClipboardList,
      },
      {
        name: "Inventory",
        path: "/inventory",
        icon: Package,
      },
      {
        name: "Invoices",
        path: "/invoices",
        icon: Receipt,
      },
      {
        name: "Profile",
        path: "/profile",
        icon: User,
      },
    ],
  };


  const menus = menuConfig[role] || menuConfig.employee;


  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };


  return (
    <aside className="
      fixed
      left-0
      top-0
      h-screen
      w-72
      bg-slate-950
      text-white
      flex
      flex-col
      shadow-2xl
    ">

      {/* Brand */}

      <div className="
        p-6
        border-b
        border-slate-800
      ">
        <h1 className="
          text-2xl
          font-bold
          tracking-wide
        ">
          🚀 AMDox ERP
        </h1>

        <p className="
          text-sm
          text-slate-400
          mt-1
        ">
          Management System
        </p>
      </div>


      {/* Role */}

      <div className="
        mx-4
        mt-4
        p-3
        rounded-xl
        bg-slate-900
      ">
        <p className="text-xs text-slate-400">
          Logged in as
        </p>

        <p className="
          capitalize
          font-semibold
        ">
          {role}
        </p>
      </div>


      {/* Menu */}

      <nav className="
        flex-1
        p-4
        space-y-2
        overflow-y-auto
      ">

        {menus.map((menu) => {

          const Icon = menu.icon;

          const active =
            location.pathname === menu.path;


          return (
            <Link
              key={menu.path}
              to={menu.path}
              className={`
                flex
                items-center
                gap-3
                px-4
                py-3
                rounded-xl
                transition-all

                ${
                  active
                  ?
                  "bg-blue-600 shadow-lg"
                  :
                  "text-slate-300 hover:bg-slate-800 hover:text-white"
                }
              `}
            >

              <Icon size={20}/>

              <span>
                {menu.name}
              </span>

            </Link>
          );

        })}

      </nav>


      {/* Logout */}

      <div className="
        p-4
        border-t
        border-slate-800
      ">

        <button
          onClick={logout}
          className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            bg-red-500
            hover:bg-red-600
            py-3
            rounded-xl
            transition
          "
        >

          <LogOut size={20}/>

          Logout

        </button>

      </div>


    </aside>
  );
}