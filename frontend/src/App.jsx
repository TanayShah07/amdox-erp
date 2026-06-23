import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import Attendance from "./pages/Attendance";
import Leaves from "./pages/Leaves";
import Payroll from "./pages/Payroll";
import MyProjects from "./pages/MyProjects";
import Ledger from "./pages/Ledger";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";

import Sidebar from "./components/Sidebar";
import ChatBot from "./components/ChatBot";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
};

const AdminHrRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/" replace />;
  if (role !== "admin" && role !== "hr")
    return <Navigate to="/dashboard" replace />;

  return children;
};

const MainLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-72 w-full min-h-screen bg-gray-100 p-5">
        {children}
        <ChatBot />
      </div>
    </div>
  );
};

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
          path="/ledger"
          element={
            <AdminHrRoute>
              <MainLayout>
                <Ledger />
              </MainLayout>
            </AdminHrRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <AdminHrRoute>
              <MainLayout>
                <Inventory />
              </MainLayout>
            </AdminHrRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <AdminHrRoute>
              <MainLayout>
                <Invoices />
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

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;