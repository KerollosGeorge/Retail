import "./style.css";
import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./context/AuthContext.jsx";
import Cookies from "js-cookie";
import { DarkModeContext } from "./context/DarkmoodContext.jsx";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Home } from "./pages/Home.jsx";
import { Toaster } from "react-hot-toast";
import { Login } from "./pages/Login.jsx";
import { SignUp } from "./pages/Register.jsx";
import { Product } from "./pages/Product.jsx";
import { Profile } from "./pages/Profile.jsx";
import { CategoryProducts } from "./pages/CategoryProducts.jsx";
import { AboutUs } from "./pages/AboutUs.jsx";
import { ForgetPassword } from "./pages/ForgetPassword.jsx";
import { ResetPassword } from "./pages/ResetPassword.jsx";
import { Cart } from "./pages/Cart.jsx";
import { Products } from "./pages/Products.jsx";
import { CategoriesPage } from "./pages/Categories.jsx";

// Scroll to top on every location change
const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Force scroll to top on all navigations including browser back/forward
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
};

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    if (!token) {
      Cookies.remove("access_token");
      Cookies.remove("user");
    }
  }, [token]);

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { darkMode } = useContext(DarkModeContext);
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ScrollToTop />
      <div className={darkMode ? "dark" : "light"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/category/:categoryId" element={<CategoryProducts />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/forget_password" element={<ForgetPassword />} />
          <Route
            path="/reset_password/:id/:token"
            element={
              <ProtectedRoute>
                <ResetPassword />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
