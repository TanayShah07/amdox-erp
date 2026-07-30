import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Auth from "./Pages/Auth";
import Dashboard from "./Pages/Dashboard";
import Employees from "./Pages/Employees";
import Profile from "./Pages/Profile";
import Projects from "./Pages/Projects";
import Attendance from "./Pages/Attendance";
import Leaves from "./Pages/Leaves";
import Payroll from "./Pages/Payroll";
import MyProjects from "./Pages/MyProjects";
import Ledger from "./Pages/Ledger";
import Inventory from "./Pages/Inventory";
import Invoices from "./Pages/Invoices";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ChatBot from "./components/ChatBot";
import Analytics from "./Pages/Analytics";
import PurchaseOrders from "./Pages/PurchaseOrders";
import Notifications from "./Pages/Notifications";
import AuditLogs from "./Pages/AuditLogs";
import Landing from "./pages/Landing";

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
      <main
        className="
        ml-72
        w-full
        min-h-screen
        bg-gray-100
        p-6
        "
      >
        <Navbar />
        {children}
        <ChatBot />
      </main>
    </div>
  );
};
function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Landing/>}/>
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
          path="/analytics"
          element={
            <AdminHrRoute>
              <MainLayout>
                <Analytics />
              </MainLayout>
            </AdminHrRoute>
          }
        />
        
        <Route
          path="/purchase-orders"
          element={
            <AdminHrRoute>
              <MainLayout>
                <PurchaseOrders />
              </MainLayout>
            </AdminHrRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <AdminHrRoute>
              <MainLayout>
                <Notifications />
              </MainLayout>
            </AdminHrRoute>
          }
        />

        <Route
          path="/audit-logs"
          element={
            <AdminHrRoute>
              <MainLayout>
                <AuditLogs />
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