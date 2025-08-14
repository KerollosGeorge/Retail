import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { DarkModeContextProvider } from "./context/DarkmoodContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EscapeListener } from "./components/EscapeListener.jsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <DarkModeContextProvider>
          <CartProvider>
            <EscapeListener />
            <App />
          </CartProvider>
        </DarkModeContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
