import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

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
          icon: "🏠",
          path: "/dashboard",
        },
        {
          name: "My Projects",
          icon: "📁",
          path: "/my-projects",
        },
        {
          name: "Leaves",
          icon: "🏖️",
          path: "/leaves",
        },
        {
          name: "Profile",
          icon: "👤",
          path: "/profile",
        },
      ]
    : role === "hr"
    ? [
        {
          name: "Dashboard",
          icon: "🏠",
          path: "/dashboard",
        },
        {
          name: "Employees",
          icon: "👨‍💼",
          path: "/employees",
        },
        {
          name: "Projects",
          icon: "📁",
          path: "/projects",
        },
        {
          name: "Attendance",
          icon: "📅",
          path: "/attendance",
        },
        {
          name: "Leaves",
          icon: "🏖️",
          path: "/leaves",
        },
        {
          name: "Profile",
          icon: "👤",
          path: "/profile",
        },
      ]
    : [
        {
          name: "Dashboard",
          icon: "🏠",
          path: "/dashboard",
        },
        {
          name: "Employees",
          icon: "👨‍💼",
          path: "/employees",
        },
        {
          name: "Projects",
          icon: "📁",
          path: "/projects",
        },
        {
          name: "Attendance",
          icon: "📅",
          path: "/attendance",
        },
        {
          name: "Leaves",
          icon: "🏖️",
          path: "/leaves",
        },
        {
          name: "Payroll",
          icon: "💰",
          path: "/payroll",
        },
        {
          name: "Profile",
          icon: "👤",
          path: "/profile",
        },
      ];
  return (
    <div style={{ display: "flex" }}>
      {/* SIDEBAR */}
      <div
        style={{
          width: collapsed ? "70px" : "230px",
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
            padding: "15px",
            fontSize: "22px",
            fontWeight: "bold",
            marginBottom: "15px",
          }}
        >
          ERP System
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
                gap: collapsed ? "0px" : "12px",
                padding: "12px",
                cursor: "pointer",
                justifyContent: collapsed
                  ? "center"
                  : "flex-start",
                background: active
                  ? "#1f2937"
                  : "transparent",
                borderRight: active
                  ? "4px solid #3b82f6"
                  : "none",
              }}
            >
              <span style={{ fontSize: "20px" }}>
                {item.icon}
              </span>

              {!collapsed && (
                <span>{item.name}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* CONTENT */}
      <div
        style={{
          marginLeft: collapsed ? "70px" : "230px",
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
            onClick={() =>
              setCollapsed(!collapsed)
            }
            style={{
              fontSize: "24px",
              background: "none",
              border: "none",
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