// logout.js or inside any component (e.g. NavBar, Settings, etc.)
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await axios.get("/api/auth/logout", { withCredentials: true });

      // Clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      toast.success("Logged out successfully");

      // Redirect to login after short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast.error("Logout failed. Try again.");
      console.error("Logout error:", error);
    }
  };

  return logout;
};
