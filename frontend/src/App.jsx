import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CalendarDays,
  Plane,
  Wallet,
  User,
} from "lucide-react";

import { Toaster } from "react-hot-toast";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import Attendance from "./pages/Attendance";
import Leaves from "./pages/Leaves";
import Payroll from "./pages/Payroll";
import ChatBot from "./components/ChatBot";
import MyProjects from "./pages/MyProjects";
/* ---------------- PROTECTED ROUTE ---------------- */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/* ---------------- ADMIN / HR ROUTE ---------------- */
const AdminHrRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (role !== "admin" && role !== "hr") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/* ---------------- LAYOUT ---------------- */
const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role");

const menu =
  role === "employee"
    ? [
        {
          name: "Dashboard",
          icon: <LayoutDashboard size={20} />,
          path: "/dashboard",
        },
        {
          name: "My Projects",
          icon: <FolderKanban size={20} />,
          path: "/my-projects",
        },
        {
          name: "Attendance",
          icon: <CalendarDays size={20} />,
          path: "/attendance",
        },
        {
          name: "Leaves",
          icon: <Plane size={20} />,
          path: "/leaves",
        },
        {
          name: "Profile",
          icon: <User size={20} />,
          path: "/profile",
        },
      ]
    : role === "hr"
    ? [
        {
          name: "Dashboard",
          icon: <LayoutDashboard size={20} />,
          path: "/dashboard",
        },
        {
          name: "Employees",
          icon: <Users size={20} />,
          path: "/employees",
        },
        {
          name: "Projects",
          icon: <FolderKanban size={20} />,
          path: "/projects",
        },
        {
          name: "Attendance",
          icon: <CalendarDays size={20} />,
          path: "/attendance",
        },
        {
          name: "Leaves",
          icon: <Plane size={20} />,
          path: "/leaves",
        },
        {
          name: "Profile",
          icon: <User size={20} />,
          path: "/profile",
        },
      ]
    : [
        {
          name: "Dashboard",
          icon: <LayoutDashboard size={20} />,
          path: "/dashboard",
        },
        {
          name: "Employees",
          icon: <Users size={20} />,
          path: "/employees",
        },
        {
          name: "Projects",
          icon: <FolderKanban size={20} />,
          path: "/projects",
        },
        {
          name: "Attendance",
          icon: <CalendarDays size={20} />,
          path: "/attendance",
        },
        {
          name: "Leaves",
          icon: <Plane size={20} />,
          path: "/leaves",
        },
        {
          name: "Payroll",
          icon: <Wallet size={20} />,
          path: "/payroll",
        },
        {
          name: "Profile",
          icon: <User size={20} />,
          path: "/profile",
        },
      ];
  return (
    <div style={{ display: "flex" }}>
      {/* SIDEBAR */}
      <div
        style={{
          width: collapsed ? "90px" : "260px",
          height: "100vh",
          background: "#111",
          color: "white",
          transition: "0.3s",
          position: "fixed",
          top: 0,
          left: 0,
          paddingTop: "10px",
        }}
      >
        <div
        style={{
          textAlign: "center",
          padding: "20px",
          fontSize: "22px",
          fontWeight: "bold",
          marginBottom: "20px",
          borderBottom: "1px solid #333",
        }}
       >
        {collapsed ? "ERP" : "ERP System"}
       </div>

        {menu.map((item) => {
          const active = location.pathname === item.path;

          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 18px",
                cursor: "pointer",
                margin: "6px 10px",
                borderRadius: "10px",
                background: active
                  ? "#2563eb"
                  : "transparent",
                boxShadow: active
                ? "0 4px 12px rgba(37,99,235,0.3)"
                : "none",  
                transition: "0.3s",
             }}
            >
            <span
              style={{
                fontSize: "22px",
                minWidth: "30px",
                textAlign: "center",
              }}
            >
              {item.icon}
            </span>

            {!collapsed && (
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: "500",
                }}
              >
                {item.name}
              </span>
            )}
          </div>
          );
        })}
      </div>

      {/* CONTENT */}
      <div
        style={{
          marginLeft: collapsed ? "90px" : "260px",
          width: "100%",
          transition: "0.3s",
        }}
      >
        <div
          style={{
            padding: "15px 20px",
            background: "#fff",
            borderBottom: "1px solid #ddd",
            position: "sticky",
            top: 0,
            zIndex: 1000,
          }}
        >
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: "24px",
            background: "#f3f4f6",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
        </div>

       <div style={{ padding: "20px" }}>
  {children}
  <ChatBot />
</div>
      </div>
    </div>
  );
};

/* ---------------- APP ---------------- */
function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Auth />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <AdminHrRoute>
              <MainLayout>
                <Employees />
              </MainLayout>
            </AdminHrRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Projects />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-projects"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MyProjects />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Attendance />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaves"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Leaves />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payroll"
          element={
            <AdminHrRoute>
              <MainLayout>
                <Payroll />
              </MainLayout>
            </AdminHrRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;