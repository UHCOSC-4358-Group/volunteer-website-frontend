import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

interface User {
  id: number;
  role: "volunteer" | "admin";
  first_name: string;
  last_name: string;
  image_url: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

type AuthAction =
  | { type: "LOGIN"; payload: { user: User; token: string } }
  | { type: "LOGOUT" }
  | { type: "STOP_LOADING" };

function authReducer(state: any, action: AuthAction) {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
      };
    case "LOGOUT":
      return { ...state, user: null, token: null };
    case "STOP_LOADING":
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  const login = (user: User, token: string) => {
    localStorage.setItem("access_token", token);
    console.log(
      "✅ Token saved to localStorage:",
      token.substring(0, 20) + "..."
    );
    console.log(
      "✅ Token verification:",
      localStorage.getItem("access_token")?.substring(0, 20) + "..."
    );
    dispatch({ type: "LOGIN", payload: { user, token } });
    if (user.role === "volunteer") {
      navigate("/volunteer-profile");
    } else {
      navigate("/OrgDashboard");
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("access_token");
      dispatch({ type: "LOGOUT" });
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we already have a token in state (prevents race condition)
        if (state.token) {
          console.log("✅ Already authenticated, skipping auth check");
          dispatch({ type: "STOP_LOADING" });
          return;
        }

        const token = localStorage.getItem("access_token");

        console.log(
          "🔍 Checking auth - token from localStorage:",
          token ? token.substring(0, 20) + "..." : "null"
        );

        if (token === null) {
          console.log("❌ No token found in localStorage");
          dispatch({ type: "STOP_LOADING" });
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const { id, user_type, first_name, last_name, email, image_url } =
            await response.json();

          const user: User = {
            id,
            role: user_type,
            first_name,
            last_name,
            image_url,
            email,
            name: [first_name, last_name].filter(Boolean).join(" ") || email,
          };

          dispatch({ type: "LOGIN", payload: { user, token } });
          if (user.role === "volunteer") {
            navigate("/volunteer-profile");
          } else {
            navigate("/OrgDashboard");
          }
        } else {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("access_token");
            dispatch({ type: "LOGOUT" });
          }
        }
      } catch (error) {
        console.error("❌ Auth check failed", error);
        dispatch({ type: "LOGOUT" });
      } finally {
        dispatch({ type: "STOP_LOADING" });
      }
    };

    checkAuth();
  }, []); // Only run once on mount, not on token changes

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
