import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // ✅ NEW

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = isLogin
      ? "http://localhost:5000/login"
      : "http://localhost:5000/signup";

    const body = isLogin
      ? { email, password }
      : { name, email, password };

<<<<<<< HEAD
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
=======
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
>>>>>>> 5c33efc5fb15bba6ec1ff854a0157bbe6ec31db7

      const data = await res.json();
      console.log("RESPONSE:", data);

<<<<<<< HEAD
    if (data.success && data.token) {
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } else {
      alert(data.message || "Error");
=======
      if (data.success) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        toast.success(
          isLogin ? "Login successful 🎉" : "Signup successful 🎉"
        );

        navigate("/dashboard");
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Try again.");
>>>>>>> 5c33efc5fb15bba6ec1ff854a0157bbe6ec31db7
    }

    setLoading(false);
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

        {/* NAME (only signup) */}
        {!isLogin && (
          <input
            type="text"
            required
            className="w-full p-3 border mb-3 rounded-lg"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        {/* EMAIL */}
        <input
          type="email"
          required
          autoFocus
          className="w-full p-3 border mb-3 rounded-lg"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            className="w-full p-3 border mb-4 rounded-lg"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 cursor-pointer text-gray-500"
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Please wait..."
            : isLogin
            ? "Login"
            : "Sign Up"}
        </button>

        {/* SWITCH */}
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