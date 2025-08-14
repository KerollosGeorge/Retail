import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faUser,
  faEnvelope,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const SignUp = () => {
  const [showPass, setShowPass] = useState(false);
  const [showRepeatPass, setShowRepeatPass] = useState(false);
  const navigate = useNavigate();

  const [creds, setCreds] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
  });

  const [errorField, setErrorField] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  axios.defaults.withCredentials = true;

  const handleClick = async (e) => {
    e.preventDefault();
    const { field, message } = validateFields(creds);
    if (field) {
      setErrorField(field);
      setErrorMessage(message);
      return;
    }

    // Gmail users must register via Google
    if (creds.email.endsWith("@gmail.com")) {
      toast.error("Please register with Google for Gmail accounts");
      return;
    }

    try {
      const res = await axios.post("/api/auth/register", creds);
      toast.success(res.data.message || "Registered successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  const validateFields = ({
    username,
    email,
    password,
    confirmPassword,
    gender,
  }) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!username)
      return { field: "username", message: "Username is required" };
    if (username.length < 3)
      return {
        field: "username",
        message: "Username must be at least 3 characters",
      };
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
    if (!confirmPassword)
      return {
        field: "confirmPassword",
        message: "Please confirm your password",
      };
    if (password !== confirmPassword)
      return { field: "confirmPassword", message: "Passwords do not match" };
    if (!gender)
      return { field: "gender", message: "Please select your gender" };
    return { field: "", message: "" };
  };

  const updateField = (field, value) => {
    setCreds({ ...creds, [field]: value });
    if (errorField === field) {
      const { field: nextField, message } = validateFields({
        ...creds,
        [field]: value,
      });
      setErrorField(nextField);
      setErrorMessage(message);
    }
  };

  // Google One Tap login setup
  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });

      google.accounts.id.renderButton(
        document.getElementById("googleSignUpDiv"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }, []);

  const handleGoogleCallback = async (response) => {
    try {
      const res = await axios.post("/api/auth/google", {
        credential: response.credential,
      });

      toast.success(res.data.message || "Signed up with Google successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Google sign-up failed");
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-sky-200 text-gray-700">
      <div className="w-[90%] max-w-[400px] bg-white shadow-2xl rounded-2xl p-8 space-y-5">
        <h1 className="text-3xl font-bold text-center text-blue-800">
          Create Account
        </h1>

        {/* Google Sign-In */}
        <div id="googleSignUpDiv" className="w-full mb-4"></div>
        <div className="relative text-center text-sm text-gray-400 mb-4">
          <span className="bg-white px-2 relative z-10">
            or sign up with email
          </span>
          <div className="absolute left-0 right-0 top-1/2 border-t border-gray-300"></div>
        </div>

        <form className="space-y-4" onSubmit={handleClick}>
          {/* Username */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faUser}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type="text"
              placeholder="Username"
              value={creds.username}
              onChange={(e) => updateField("username", e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none ${
                errorField === "username"
                  ? "border-red-500"
                  : "focus:ring-2 focus:ring-blue-400"
              }`}
            />
            {errorField === "username" && (
              <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type="text"
              placeholder="Email"
              value={creds.email}
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
              value={creds.password}
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

          {/* Confirm Password */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faLock}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type={showRepeatPass ? "text" : "password"}
              placeholder="Confirm Password"
              value={creds.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none ${
                errorField === "confirmPassword"
                  ? "border-red-500"
                  : "focus:ring-2 focus:ring-blue-400"
              }`}
            />
            <FontAwesomeIcon
              icon={faEye}
              className="absolute right-3 top-3 text-gray-500 cursor-pointer"
              onClick={() => setShowRepeatPass(!showRepeatPass)}
            />
            {errorField === "confirmPassword" && (
              <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <div className="flex justify-around items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={creds.gender === "male"}
                  onChange={() => updateField("gender", "male")}
                  className="accent-blue-600"
                />
                <span>Male</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={creds.gender === "female"}
                  onChange={() => updateField("gender", "female")}
                  className="accent-pink-500"
                />
                <span>Female</span>
              </label>
            </div>
            {errorField === "gender" && (
              <p className="text-sm text-red-500 mt-1 text-center">
                {errorMessage}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 text-white rounded-lg bg-blue-600 hover:bg-blue-700 transition-all"
          >
            Sign Up
          </button>
        </form>

        <div className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="hover:underline hover:text-blue-600">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faEye,
//   faUser,
//   faEnvelope,
//   faLock,
// } from "@fortawesome/free-solid-svg-icons";
// import { Link, useNavigate } from "react-router-dom";
// import { useState } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";

// export const SignUp = () => {
//   const [showPass, setShowPass] = useState(false);
//   const [showRepeatPass, setShowRepeatPass] = useState(false);
//   const navigate = useNavigate();

//   const [creds, setCreds] = useState({
//     username: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     gender: "",
//   });

//   const [errorField, setErrorField] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   axios.defaults.withCredentials = true;

//   const handleClick = async (e) => {
//     e.preventDefault();
//     const { field, message } = validateFields(creds);

//     if (field) {
//       setErrorField(field);
//       setErrorMessage(message);
//       return;
//     }

//     try {
//       const res = await axios.post("/api/auth/register", creds);
//       toast.success(res.data.message);
//       setTimeout(() => {
//         navigate("/login");
//       }, 2000);
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Registration failed");
//     }
//   };

//   const validateFields = ({
//     username,
//     email,
//     password,
//     confirmPassword,
//     gender,
//   }) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     if (!username)
//       return { field: "username", message: "Username is required" };
//     if (username.length < 3)
//       return {
//         field: "username",
//         message: "Username must be at least 3 characters",
//       };

//     if (!email) return { field: "email", message: "Email is required" };
//     if (!emailRegex.test(email))
//       return { field: "email", message: "Invalid email format" };

//     if (!password)
//       return { field: "password", message: "Password is required" };
//     if (password.length < 6)
//       return {
//         field: "password",
//         message: "Password must be at least 6 characters",
//       };

//     if (!confirmPassword)
//       return {
//         field: "confirmPassword",
//         message: "Please confirm your password",
//       };
//     if (password !== confirmPassword)
//       return { field: "confirmPassword", message: "Passwords do not match" };

//     if (!gender)
//       return { field: "gender", message: "Please select your gender" };

//     return { field: "", message: "" };
//   };

//   const updateField = (field, value) => {
//     setCreds({ ...creds, [field]: value });

//     // If the current error field is being corrected, validate again
//     if (errorField === field) {
//       const { field: nextField, message } = validateFields({
//         ...creds,
//         [field]: value,
//       });

//       setErrorField(nextField);
//       setErrorMessage(message);
//     }
//   };

//   return (
//     <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-sky-200 text-gray-700">
//       <div className="w-[90%] max-w-[400px] bg-white shadow-2xl rounded-2xl p-8 space-y-5">
//         <h1 className="text-3xl font-bold text-center text-blue-800">
//           Create Account
//         </h1>

//         <form className="space-y-4" onSubmit={handleClick}>
//           {/* Username */}
//           <div className="relative">
//             <FontAwesomeIcon
//               icon={faUser}
//               className="absolute left-3 top-3 text-gray-400"
//             />
//             <input
//               type="text"
//               placeholder="Username"
//               value={creds.username}
//               onChange={(e) => updateField("username", e.target.value)}
//               className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none ${
//                 errorField === "username"
//                   ? "border-red-500"
//                   : "focus:ring-2 focus:ring-blue-400"
//               }`}
//             />
//             {errorField === "username" && (
//               <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
//             )}
//           </div>

//           {/* Email */}
//           <div className="relative">
//             <FontAwesomeIcon
//               icon={faEnvelope}
//               className="absolute left-3 top-3 text-gray-400"
//             />
//             <input
//               type="text"
//               placeholder="Email"
//               value={creds.email}
//               onChange={(e) => updateField("email", e.target.value)}
//               className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none ${
//                 errorField === "email"
//                   ? "border-red-500"
//                   : "focus:ring-2 focus:ring-blue-400"
//               }`}
//             />
//             {errorField === "email" && (
//               <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
//             )}
//           </div>

//           {/* Password */}
//           <div className="relative">
//             <FontAwesomeIcon
//               icon={faLock}
//               className="absolute left-3 top-3 text-gray-400"
//             />
//             <input
//               type={showPass ? "text" : "password"}
//               placeholder="Password"
//               value={creds.password}
//               onChange={(e) => updateField("password", e.target.value)}
//               className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none ${
//                 errorField === "password"
//                   ? "border-red-500"
//                   : "focus:ring-2 focus:ring-blue-400"
//               }`}
//             />
//             <FontAwesomeIcon
//               icon={faEye}
//               className="absolute right-3 top-3 text-gray-500 cursor-pointer"
//               onClick={() => setShowPass(!showPass)}
//             />
//             {errorField === "password" && (
//               <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
//             )}
//           </div>

//           {/* Confirm Password */}
//           <div className="relative">
//             <FontAwesomeIcon
//               icon={faLock}
//               className="absolute left-3 top-3 text-gray-400"
//             />
//             <input
//               type={showRepeatPass ? "text" : "password"}
//               placeholder="Confirm Password"
//               value={creds.confirmPassword}
//               onChange={(e) => updateField("confirmPassword", e.target.value)}
//               className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none ${
//                 errorField === "confirmPassword"
//                   ? "border-red-500"
//                   : "focus:ring-2 focus:ring-blue-400"
//               }`}
//             />
//             <FontAwesomeIcon
//               icon={faEye}
//               className="absolute right-3 top-3 text-gray-500 cursor-pointer"
//               onClick={() => setShowRepeatPass(!showRepeatPass)}
//             />
//             {errorField === "confirmPassword" && (
//               <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
//             )}
//           </div>

//           {/* Gender */}
//           <div>
//             <div className="flex justify-around items-center gap-4">
//               <label className="flex items-center gap-2">
//                 <input
//                   type="radio"
//                   name="gender"
//                   value="male"
//                   checked={creds.gender === "male"}
//                   onChange={() => updateField("gender", "male")}
//                   className="accent-blue-600"
//                 />
//                 <span>Male</span>
//               </label>
//               <label className="flex items-center gap-2">
//                 <input
//                   type="radio"
//                   name="gender"
//                   value="female"
//                   checked={creds.gender === "female"}
//                   onChange={() => updateField("gender", "female")}
//                   className="accent-pink-500"
//                 />
//                 <span>Female</span>
//               </label>
//             </div>
//             {errorField === "gender" && (
//               <p className="text-sm text-red-500 mt-1 text-center">
//                 {errorMessage}
//               </p>
//             )}
//           </div>

//           <button
//             type="submit"
//             className="w-full py-2 text-white rounded-lg bg-blue-600 hover:bg-blue-700 transition-all"
//           >
//             Sign Up
//           </button>
//         </form>

//         <div className="text-sm text-center text-gray-600">
//           Already have an account?{" "}
//           <Link to="/login" className="hover:underline hover:text-blue-600">
//             Login here
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };
