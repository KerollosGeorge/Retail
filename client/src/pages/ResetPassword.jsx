import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";

export const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [errorField, setErrorField] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [seePassword, setSeePassword] = useState(false);

  const navigate = useNavigate();
  const { id, token } = useParams();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (errorField === "password") {
      if (value === "") {
        setErrorMessage("Password is required");
      } else if (value.length < 6) {
        setErrorMessage("Password must be at least 6 characters");
      } else {
        setErrorField("");
        setErrorMessage("");
      }
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!password) {
      setErrorField("password");
      setErrorMessage("Password is required");
      return;
    }

    if (password.length < 6) {
      setErrorField("password");
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await axios.post(`/api/auth/resetPassword/${id}/${token}`, {
        password,
      });

      if (res.data.Status === "Success") {
        toast.success("Password reset successfully!");
        setTimeout(() => navigate("/login"), 2000);
      } else if (res.data.Status === "Error with Token") {
        setErrorField("password");
        setErrorMessage("Your session has timed out, please try again later");
        setTimeout(() => {
          setErrorField("");
          setErrorMessage("");
          navigate("/login");
        }, 3000);
      } else {
        setErrorField("password");
        setErrorMessage(res.data.message || "Something went wrong");
        setTimeout(() => {
          setErrorField("");
          setErrorMessage("");
        }, 3000);
      }
    } catch (err) {
      setErrorField("password");
      setErrorMessage("Server error, please try again later");
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-sky-200">
      <div className="w-[90%] max-w-[400px] bg-white shadow-2xl rounded-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-800">
          Reset Password
        </h1>
        <form className="space-y-4" onSubmit={handleClick}>
          <div className="relative">
            <input
              type={seePassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={handleInputChange}
              className={`w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none ${
                errorField === "password"
                  ? "border-red-500"
                  : "focus:ring-2 focus:ring-blue-400"
              }`}
            />
            <FontAwesomeIcon
              icon={faEye}
              className="absolute right-3 top-3 text-gray-500 cursor-pointer"
              onClick={() => setSeePassword((prev) => !prev)}
            />
            {errorField === "password" && (
              <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
