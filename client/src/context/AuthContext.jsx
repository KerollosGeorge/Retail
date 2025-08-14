import { createContext, useEffect, useReducer } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const INIT_STATE = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("access_token") || null,
  error: null,
  loading: false,
};

export const AuthContext = createContext(INIT_STATE);

export const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_REQUEST":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload.user,
        token: action.payload.token,
        error: null,
        loading: false,
      };
    case "LOGIN_FAILURE":
      return {
        user: null,
        token: null,
        error: action.payload,
        loading: false,
      };
    case "LOGOUT":
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      return { user: null, token: null, error: null, loading: false };
    case "REFRESH_TOKEN":
      return { ...state, token: action.payload, error: null };
    default:
      return state;
  }
};

// Helper to check if token is expired
const isTokenExpired = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return Date.now() >= exp * 1000;
  } catch (e) {
    return true;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INIT_STATE);

  // Save user and token to localStorage when they change
  useEffect(() => {
    if (state.user && state.token) {
      localStorage.setItem("user", JSON.stringify(state.user));
      localStorage.setItem("access_token", state.token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
    }
  }, [state.user, state.token]);

  const logout = () => {
    axios
      .post("/api/auth/logout", {}, { withCredentials: true })
      .catch((err) => console.error("Logout failed:", err));
    dispatch({ type: "LOGOUT" });
  };

  const refreshAccessToken = async () => {
    try {
      const res = await axios.get("/api/auth/refreshToken", {
        withCredentials: true,
      });
      const newToken = res.data.token;
      dispatch({ type: "REFRESH_TOKEN", payload: newToken });
      localStorage.setItem("access_token", newToken);
    } catch (error) {
      console.error("Token refresh failed:", error);
      dispatch({ type: "LOGOUT" }); // will reset loading to false
    }
  };

  // Initial check on load
  useEffect(() => {
    const checkToken = async () => {
      dispatch({ type: "LOGIN_REQUEST" });

      const storedToken = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");

      if (!storedToken || isTokenExpired(storedToken)) {
        await refreshAccessToken();

        // Re-check for user after token refresh
        const refreshedUser = localStorage.getItem("user");
        if (!refreshedUser) {
          dispatch({ type: "LOGOUT" });
        } else {
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              user: JSON.parse(refreshedUser),
              token: localStorage.getItem("access_token"),
            },
          });
        }
      } else {
        if (!storedUser) {
          dispatch({ type: "LOGOUT" });
        } else {
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              user: JSON.parse(storedUser),
              token: storedToken,
            },
          });
        }
      }
    };

    checkToken();
  }, []);

  // Schedule auto-refresh
  useEffect(() => {
    if (!state.token) return;

    let timeoutId;
    try {
      const { exp } = jwtDecode(state.token);
      const expirationTime = exp * 1000;
      const refreshTime = expirationTime - Date.now() - 5 * 60 * 1000;

      if (refreshTime > 0) {
        timeoutId = setTimeout(refreshAccessToken, refreshTime);
      } else {
        refreshAccessToken();
      }
    } catch (e) {
      console.error("Failed to decode token:", e);
      logout();
    }

    return () => clearTimeout(timeoutId);
  }, [state.token]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loginRequest: () => dispatch({ type: "LOGIN_REQUEST" }),
        login: (user, token) =>
          dispatch({ type: "LOGIN_SUCCESS", payload: { user, token } }),
        loginFailure: (error) =>
          dispatch({ type: "LOGIN_FAILURE", payload: error }),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* import { createContext, useEffect, useReducer } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const INIT_STATE = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("access_token") || null,
  error: null,
  loading: false,
};

export const AuthContext = createContext(INIT_STATE);

export const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_REQUEST":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload.user,
        token: action.payload.token,
        error: null,
        loading: false,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        error: action.payload,
        loading: false,
      };
    case "LOGOUT":
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      return { user: null, token: null, error: null, loading: false };
    case "REFRESH_TOKEN":
      return { ...state, token: action.payload, error: null, loading: false };
    default:
      return state;
  }
};

// Helper to check if token is expired
const isTokenExpired = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return Date.now() >= exp * 1000;
  } catch (e) {
    return true; // treat invalid token as expired
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INIT_STATE);

  // Store the latest user data and token when it changes
  useEffect(() => {
    if (state.user && state.token) {
      localStorage.setItem("user", JSON.stringify(state.user));
      localStorage.setItem("access_token", state.token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
    }
  }, [state.user, state.token]);

  const logout = () => {
    axios
      .post("/api/auth/logout", {}, { withCredentials: true })
      .catch((err) => console.error(err));
    dispatch({ type: "LOGOUT" });
  };

  // Function to refresh token
  const refreshAccessToken = async () => {
    try {
      const res = await axios.get("/api/auth/refreshToken", {
        withCredentials: true,
      });
      const newToken = res.data.token;
      dispatch({ type: "REFRESH_TOKEN", payload: newToken });
      localStorage.setItem("access_token", newToken);
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
    }
  };

  // Check token validity on load
  useEffect(() => {
    const checkToken = async () => {
      const storedToken = localStorage.getItem("access_token");
      if (!storedToken || isTokenExpired(storedToken)) {
        await refreshAccessToken();
      }
    };

    checkToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loginRequest: () => dispatch({ type: "LOGIN_REQUEST" }),
        login: (user, token) =>
          dispatch({ type: "LOGIN_SUCCESS", payload: { user, token } }),
        loginFailure: (error) =>
          dispatch({ type: "LOGIN_FAILURE", payload: error }),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

 */
