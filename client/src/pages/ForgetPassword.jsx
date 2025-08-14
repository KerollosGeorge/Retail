import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

export const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [errorField, setErrorField] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setEmail(e.target.value);

    if (errorField === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (e.target.value === "") {
        setErrorMessage("Email is required");
      } else if (!emailRegex.test(e.target.value)) {
        setErrorMessage("Invalid email format");
      } else {
        setErrorField("");
        setErrorMessage("");
      }
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setErrorField("email");
      setErrorMessage("Email is required");
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorField("email");
      setErrorMessage("Invalid email format");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/auth/forgetPassword", { email });

      if (response.data.Status === "Success") {
        setSuccessMessage("Check your email for reset instructions");
        setTimeout(() => {
          setSuccessMessage("");
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      setErrorField("email");
      setErrorMessage("We can't find your email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-sky-200 text-gray-700">
      <div className="w-[90%] max-w-[400px] bg-white shadow-2xl rounded-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-800">
          Forgot Password
        </h1>
        <form className="space-y-4" onSubmit={handleClick}>
          {/* Email input */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={handleInputChange}
              disabled={loading}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none ${
                errorField === "email"
                  ? "border-red-500"
                  : "focus:ring-2 focus:ring-blue-400"
              } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            {errorField === "email" && (
              <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>

          {/* Feedback */}
          {successMessage && (
            <p className="text-sm text-green-600 text-center">
              {successMessage}
            </p>
          )}

          {/* Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate("/login")}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white transition-all ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
