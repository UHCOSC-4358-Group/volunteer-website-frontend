import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";

import { UserCreateForm } from "./Signup";

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

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Register to get started!</p>
        {errors.length !== 0 && <div className="error-message">{errors}</div>}
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
          <button
            type="button"
            className="auth-button"
            onClick={() => setFormStep(1)}
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
