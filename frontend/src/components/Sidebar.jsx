import { useNavigate } from "react-router-dom";

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();

  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-6 flex flex-col z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">ERP</h2>
          <button onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="mb-3 text-left px-3 py-2 rounded hover:bg-gray-700"
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate("/employees")}
          className="mb-3 text-left px-3 py-2 rounded hover:bg-gray-700"
        >
          Employees
        </button>

        {/* ✅ NEW PROJECTS BUTTON */}
        <button
          onClick={() => navigate("/projects")}
          className="mb-3 text-left px-3 py-2 rounded hover:bg-gray-700"
        >
          Projects
        </button>

        <button
          onClick={() => navigate("/profile")}
          className="mt-auto text-left px-3 py-2 rounded hover:bg-gray-700"
        >
          Settings
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}