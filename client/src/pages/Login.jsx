import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";
import toast from "react-hot-toast";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errorField, setErrorField] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const { loading, loginRequest, login, loginFailure } =
    useContext(AuthContext);

  const validateFields = (email, password) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) return { field: "email", message: "Email is required" };
    if (!emailRegex.test(email))
      return { field: "email", message: "Invalid email format" };

    if (!password)
      return { field: "password", message: "Password is required" };
    if (password.length < 6)
      return {
        field: "password",
        message: "Password must be at least 6 characters",
      };

    return { field: "", message: "" };
  };

  const handleClick = async (e) => {
    e.preventDefault();

    const { field, message } = validateFields(email, password);
    if (field) {
      setErrorField(field);
      setErrorMessage(message);
      return;
    }

    loginRequest();
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      login(res.data.user, res.data.token);
      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      toast.error(errorMessage);
      loginFailure(errorMessage);
    }
  };

  const updateField = (field, value) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);

    if (errorField === field) {
      const { field: nextField, message } = validateFields(
        field === "email" ? value : email,
        field === "password" ? value : password
      );

      setErrorField(nextField);
      setErrorMessage(message);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-sky-200 text-gray-700">
      <div className="w-[90%] max-w-[400px] bg-white shadow-2xl rounded-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-800">
          Welcome Back
        </h1>
        <form className="space-y-4" onSubmit={handleClick}>
          {/* Email */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => updateField("email", e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none ${
                errorField === "email"
                  ? "border-red-500"
                  : "focus:ring-2 focus:ring-blue-400"
              }`}
            />
            {errorField === "email" && (
              <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faLock}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => updateField("password", e.target.value)}
              className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none ${
                errorField === "password"
                  ? "border-red-500"
                  : "focus:ring-2 focus:ring-blue-400"
              }`}
            />
            <FontAwesomeIcon
              icon={faEye}
              className="absolute right-3 top-3 text-gray-500 cursor-pointer"
              onClick={() => setShowPass(!showPass)}
            />
            {errorField === "password" && (
              <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-2 text-white rounded-lg bg-blue-600 hover:bg-blue-700 transition-all ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex justify-between text-sm text-gray-600">
          <Link
            to={"/forget_password"}
            className="hover:underline hover:text-blue-600"
          >
            Forgot Password?
          </Link>
          <Link to="/register" className="hover:underline hover:text-blue-600">
            Don't have an account?
          </Link>
        </div>
      </div>
    </div>
  );
};
/* import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

export const Login = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Reset loading state if redirected to login page
  useEffect(() => {
    setIsLoading(false);
  }, [location.pathname]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await axios.post("/api/auth/login", {
        email,
        password,
      });

      // Save user and token
      setUser(data.user);
      localStorage.setItem("token", data.token);
      toast.success("Login successful!");

      // Redirect to home or previous page
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Invalid email or password.");
    } finally {
      setIsLoading(false); // ✅ Always reset loading
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white w-full max-w-md shadow-md rounded-xl p-8 flex flex-col gap-6"
      >
        <h1 className="text-3xl font-semibold text-center text-blue-600">
          Login
        </h1>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 text-white font-semibold rounded-lg transition-all ${
            isLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};
 */
