import { createContext, useContext, useReducer, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  loading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

type AuthAction =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "STOP_LOADING" };

function authReducer(state: any, action: AuthAction) {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload,
      };
    case "LOGOUT":
      return { ...state, user: null };
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
  loading: true,
};

export const AuthProvider = () => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  const login = (user: User) => {
    dispatch({ type: "LOGIN", payload: user });
  };

  const logout = async () => {
    try {
      // const BaseURL = import.meta.env.VITE_APP_BACKEND_URL;
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        dispatch({ type: "LOGOUT" });
        navigate("/");
      } else {
        throw Error("Could not log out user.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // const BaseURL = import.meta.env.VITE_APP_BACKEND_URL;
        const response = await fetch("/api/auth", {
          credentials: "include",
          headers: {
            Accept: "application/json",
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

          login(user);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("❌ Auth check failed", error);
      } finally {
        dispatch({ type: "STOP_LOADING" });
      }
    };

    checkAuth();
  }, []);

  return { ...state, login, logout };
};

export const useAuth = () => {
  return useContext(AuthContext);
};
