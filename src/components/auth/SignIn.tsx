// Import React core and the useState hook
import React, { useState } from "react";

// Import React types (these are *only* used for TypeScript type-checking)
// `ChangeEvent` = event type when typing in an <input>
// `FormEvent`   = event type when submitting a <form>
import type { ChangeEvent, FormEvent } from "react";

// Import icons from react-icons library
// FaUser = user/person icon
// FaLock = lock icon
import { FaUser, FaLock } from "react-icons/fa";

// Import useNavigate hook from react-router-dom for navigation
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/user-context";

// Import our external CSS file for styling
import "./SignIn.css";

// Define the shape (structure) of the form data using an interface
// This makes TypeScript check that our formData object always has these fields
interface FormData {
  email: string;
  password: string;
}

// Our main Auth component (functional React component with TypeScript)
const SignIn: React.FC = () => {
  const { login } = useAuth();

  const [role, setRole] = useState<"volunteer" | "organizer">("volunteer");

  // State to store form input values (email, password, confirmPassword)
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  // State for loading and errors
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Initialize navigation
  const navigate = useNavigate();

  // Handle input changes
  // Called whenever user types in an input field
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError("");
  };

  // Mock login function - replace with your actual API call
  const loginVolunteer = async (userData: FormData): Promise<void> => {
    // const baseURL = import.meta.env.VITE_APP_BACKEND_URL as string;

    const response = await fetch("/api/auth/vol/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const content = await response.json();

    if (response.ok) {
      const user = {
        id: content.id,
        role: content.user_type,
        first_name: content.first_name,
        last_name: content.last_name,
        email: content.email,
        name:
          [content.first_name, content.last_name].filter(Boolean).join(" ") ||
          content.email,
      };

      login(user);
    } else {
      throw Error(content.error.message);
    }
  };

  const loginAdmin = async (userData: FormData): Promise<void> => {
    // const baseURL = import.meta.env.VITE_APP_BACKEND_URL as string;

    const response = await fetch("/api/auth/org/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    

    const content = await response.json();

    if (response.ok) {
      const user = {
        id: content.id,
        role: content.user_type,
        first_name: content.first_name,
        last_name: content.last_name,
        email: content.email,
        name:
          [content.first_name, content.last_name].filter(Boolean).join(" ") ||
          content.email,
      };

      login(user);
    } else {
      throw Error(content.error.message);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // stops default page reload on form submit

    setLoading(true);
    setError("");

    try {
      if (role === "volunteer") {
        await loginVolunteer(formData);
        navigate("/volunteer-profile");
      } else {
        await loginAdmin(formData);
        navigate("/OrgDashboard");
      }
    } catch (err) {
      // Handle errors from API or validation
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Outer container with full-screen gradient background
    <div className="auth-container">
      {/* Card (glass-like box in the middle) */}
      <div className="auth-card">
        <h2 className="auth-title">Welcome back</h2>
        {/* Subtitle under the title */}
        <p className="auth-subtitle">Sign in to your account</p>
        {error && <p className="auth-error">{error}</p>}
        <div className="role-selection">
          <p className="register-text">Signing in as:</p>
          <div className="role-options">
            <button
              type="button"
              className={`role-button ${role === "volunteer" ? "active" : ""}`}
              onClick={() => setRole("volunteer")}
              disabled={loading}
            >
              Volunteer
            </button>
            <button
              type="button"
              className={`role-button ${role === "organizer" ? "active" : ""}`}
              onClick={() => setRole("organizer")}
              disabled={loading}
            >
              Organizer
            </button>
          </div>
        </div>

        {/* Form section */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* Password input with lock icon */}
          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Processing..." : "Sign In"}
          </button>
        </form>

        {/* Footer link to toggle between Register and Login */}
        <div className="auth-footer">
          <p className="text-center text-navy font-medium">
            Don't have an account?&nbsp;
            <span
              className="font-bold cursor-pointer"
              onClick={() => {
                navigate("/signup");
              }}
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
