import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import { UserCreateForm } from "./Signup";
import { useState } from "react";

const SignupFirstForm = ({
  errors,
  handleTextChange,
  formData,
  setFormStep,
  handleRoleChange,
}: {
  errors: string[];
  handleTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formData: UserCreateForm;
  setFormStep: React.Dispatch<React.SetStateAction<number>>;
  handleRoleChange: (role: "volunteer" | "organizer") => void;
}) => {
  const navigate = useNavigate();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    
    return errors;
  };

  // Handle continue button click with validation
  const handleContinue = () => {
    const newErrors: string[] = [];

    // Validate email
    if (!formData.email) {
      newErrors.push("Email is required");
    } else if (!isValidEmail(formData.email)) {
      newErrors.push("Please enter a valid email address");
    }

    // Validate password
    if (!formData.password) {
      newErrors.push("Password is required");
    } else {
      const passwordErrors = validatePassword(formData.password);
      newErrors.push(...passwordErrors);
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.push("Please confirm your password");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.push("Passwords do not match");
    }

    // Validate role selection
    if (!formData.role) {
      newErrors.push("Please select a role (Volunteer or Organizer)");
    }

    if (newErrors.length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    // Clear errors and proceed
    setValidationErrors([]);
    setFormStep(1);
  };

  // Combine validation errors with prop errors
  const allErrors = [...errors, ...validationErrors];

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Register to get started!</p>
        
        {allErrors.length !== 0 && (
          <div className="error-message">
            {allErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}

        <div className="role-selection">
          <p className="register-text">Registering as?</p>
          <div className="role-options">
            <button
              type="button"
              className={`role-button ${
                formData.role === "volunteer" ? "active" : ""
              }`}
              onClick={() => handleRoleChange("volunteer")}
            >
              Volunteer
            </button>
            <button
              type="button"
              className={`role-button ${
                formData.role === "organizer" ? "active" : ""
              }`}
              onClick={() => handleRoleChange("organizer")}
            >
              Organizer
            </button>
          </div>
        </div>

        <div className="auth-form">
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleTextChange}
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleTextChange}
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleTextChange}
              required
            />
          </div>

          {/* Password requirements hint */}
          {formData.password && (
            <div className="password-requirements">
              <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "-10px" }}>
                Password must contain: 8+ characters, uppercase, lowercase, number, and special character
              </p>
            </div>
          )}

          <button
            type="button"
            className="auth-button"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>

        <p className="text-center text-navy font-medium">
          Already have an account?&nbsp;
          <span
            className="font-bold cursor-pointer"
            onClick={() => {
              navigate("/");
            }}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignupFirstForm;