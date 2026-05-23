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

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      {/* ✅ TOAST NOTIFICATIONS */}
      {/* ✅ TOAST */}
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        <Route path="/" element={<Auth />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance" 
          element={
            <Attendance />
          } 
        />

        <Route
          path="/leaves"
          element={
            <Leaves />
          } 
        />

        <Route
          path="/payroll"
          element={
            <Payroll />
          } 
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;