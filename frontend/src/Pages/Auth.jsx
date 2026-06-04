import { useState } from "react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import {
  signInWithPopup,
} from "firebase/auth";

import {
  auth,
  googleProvider,
} from "../firebase";

export default function Auth() {

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [role, setRole] = useState("employee");

const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);

const [isLogin, setIsLogin] = useState(true);

const navigate = useNavigate();
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      const user = result.user;

      const res = await fetch(
        "http://localhost:5000/google-login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: user.displayName,
            email: user.email,
          }),
        }
      );

      const data = await res.json();

      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "role",
          data.role
        );

        toast.success(
          "Google Login Successful"
        );

        navigate("/dashboard");
      } else {
        toast.error(
          data.message ||
            "Google Login Failed"
        );
      }
    } catch (err) {
  console.log(err);
  toast.error("Google Login Failed");
}
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (loading) return;

    setLoading(true);

    // Correct Backend URLs
    const url = isLogin
      ? "http://localhost:5000/api/auth/login"
      : "http://localhost:5000/api/auth/signup";

    const body = isLogin
      ? {
          email,
          password,
        }
      : {
          name,
          email,
          password,
          role,
        };

    try {

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (res.ok && data.token) {

    localStorage.setItem("token", data.token);

    if (data.role) {
      localStorage.setItem("role", data.role);
    }

    toast.success(
      isLogin ? "Login successful" : "Signup successful"
    );

    setTimeout(() => {
      navigate("/dashboard");
    }, 500);

  } else {
    toast.error(data.message || "Invalid credentials");
  }

} catch (err) {
  console.log(err);
  toast.error("Server request failed");
} finally {
  setLoading(false);
}

  };

  return (

    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-200">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-96"
      >

        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
  {isLogin ? "Login" : "Sign Up"}
</h2>

        {!isLogin && (

          <>

            <input
              type="text"
              required
              placeholder="Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full p-3 border mb-3 rounded-lg"
            />

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
              className="w-full p-3 border mb-3 rounded-lg"
            >

              <option value="employee">
                Employee
              </option>

              <option value="hr">
                HR
              </option>

            </select>

          </>

        )}

        <input
          type="email"
          required
          autoFocus
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full p-3 border mb-3 rounded-lg"
        />

        <div className="relative">

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            required
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="w-full p-3 border mb-4 rounded-lg"
          />

          <span
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
            className="absolute right-3 top-3 cursor-pointer text-gray-500"
          >
            {showPassword
              ? "Hide"
              : "Show"}

            

          </span>

        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
        >

         {loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}

        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full mt-3 border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="google"
            className="w-5 h-5"
          />

          Sign in with Google
        </button>

       <p
  className="text-sm text-center mt-4 cursor-pointer text-blue-600 hover:underline"
  onClick={() => setIsLogin(!isLogin)}
>

          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}

        </p>

      </form>

    </div>
  );
}