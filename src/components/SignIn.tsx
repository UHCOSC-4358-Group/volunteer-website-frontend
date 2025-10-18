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

// Import our external CSS file for styling
import "./SignIn.css";

// Define the shape (structure) of the form data using an interface
// This makes TypeScript check that our formData object always has these fields
interface FormData {
  email: string;
  password: string;
  confirmPassword?: string; // optional field (only used in registration)
}

// Our main Auth component (functional React component with TypeScript)
const SignIn: React.FC = () => {
  // State to track whether user is on Register page or Login page
  const [isRegister, setIsRegister] = useState<boolean>(false);

  // State to store form input values (email, password, confirmPassword)
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
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

  // Mock registration function - replace with your actual API call
  const registerUser = async (userData: FormData): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add your actual registration logic here
    console.log("Registering user:", userData);
    
    // For demo purposes, always succeed. In real app, check response
    return Promise.resolve();
  };

  // Mock login function - replace with your actual API call
  const loginUser = async (userData: FormData): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add your actual login logic here
    console.log("Logging in user:", userData);
    
    // For demo purposes, always succeed. In real app, check response
    return Promise.resolve();
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // stops default page reload on form submit
    
    setLoading(true);
    setError("");

    try {
      if(formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      if (isRegister) {
        // Registration logic
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        
        await registerUser(formData);
        console.log("Registration successful:", formData);
        
        // Redirect to volunteer profile after successful registration
        navigate('/Profile'); 
        
      } else {
        // Login logic
        await loginUser(formData);
        console.log("Login successful:", formData);
        
        // Redirect to dashboard or home page after successful login
        navigate('/OrgDashboard'); // 
      }
    } catch (err) {
      // Handle errors from API or validation
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
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
        {/* Title changes depending on whether it's login or register */}
        <h2 className="auth-title">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h2>

        {/* Subtitle under the title */}
        <p className="auth-subtitle">
          {isRegister ? "Register to get started" : "Sign in to your account"}
        </p>

        {/* Error message display */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Form section */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email input with user icon */}
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

          {/* Confirm password field only shows up on Register page */}
          {isRegister && (
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          )}

          {/* Submit button */}
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Processing..." : (isRegister ? "Register" : "Sign In")}
          </button>
        </form>

        {/* Footer link to toggle between Register and Login */}
        <div className="auth-footer">
          {isRegister ? (
            <p>
              Already have an account?{" "}
              <span onClick={() => !loading && setIsRegister(false)}>Sign In</span>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <span onClick={() => !loading && setIsRegister(true)}>Sign Up</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Export this component so it can be used in App.tsx or elsewhere
export default SignIn;