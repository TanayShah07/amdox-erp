import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import toast from "react-hot-toast";

export default function Sidebar({
  isOpen,
  setIsOpen,
}) {
  const navigate = useNavigate();

  const location = useLocation();

  const role =
    localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();

    toast.success(
      "Logged out successfully"
    );

    window.location.replace("/");
  };

  const menuClass = (path) =>
    `mb-3 text-left px-3 py-2 rounded transition ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "hover:bg-gray-700"
    }`;

  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-6 flex flex-col z-40 transform transition-transform duration-300 ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">
            ERP System
          </h2>

          <button
            onClick={() =>
              setIsOpen(false)
            }
            className="text-xl"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className={menuClass(
              "/dashboard"
            )}
          >
            Dashboard
          </button>

          {(role === "admin" ||
            role === "hr") && (
            <>
              <button
                onClick={() =>
                  navigate(
                    "/employees"
                  )
                }
                className={menuClass(
                  "/employees"
                )}
              >
                Employees
              </button>

              <button
                onClick={() =>
                  navigate(
                    "/projects"
                  )
                }
                className={menuClass(
                  "/projects"
                )}
              >
                Projects
              </button>

              <button
                onClick={() =>
                  navigate(
                    "/payroll"
                  )
                }
                className={menuClass(
                  "/payroll"
                )}
              >
                Payroll
              </button>
            </>
          )}

          {role === "employee" && (
            <button
              onClick={() =>
                navigate("/projects")
              }
              className={menuClass(
                "/projects"
              )}
            >
              My Projects
            </button>
          )}

          <button
            onClick={() =>
              navigate(
                "/attendance"
              )
            }
            className={menuClass(
              "/attendance"
            )}
          >
            Attendance
          </button>

          <button
            onClick={() =>
              navigate("/leaves")
            }
            className={menuClass(
              "/leaves"
            )}
          >
            Leaves
          </button>

        </div>

        <div className="mt-auto">

          <button
            onClick={() =>
              navigate("/profile")
            }
            className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition"
          >
            Profile
          </button>

          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 rounded hover:bg-red-600 text-red-400 hover:text-white mt-2 transition"
          >
            Logout
          </button>

        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() =>
            setIsOpen(false)
          }
        />
      )}
    </>
  );
}