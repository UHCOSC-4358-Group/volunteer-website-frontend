import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import { UserCreateForm } from "./Signup";
import * as zod from "zod";

const initialUserCreateErrorsFirstForm = {
  email: "",
  password: "",
  confirmPassword: "",
};

const UserCreateFirstFormTemplate = zod.object({
  email: zod
    .email("Email format is not valid. (example@example.com)")
    .nonempty("Email cannot be empty."),
  password: zod.string().min(8, "Password must be 8 characters or longer."),
  confirmPassword: zod.string(),
});

const SignupFirstForm = ({
  handleTextChange,
  formData,
  setFormStep,
  handleRoleChange,
}: {
  handleTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formData: UserCreateForm;
  setFormStep: React.Dispatch<React.SetStateAction<number>>;
  handleRoleChange: (role: "volunteer" | "organizer") => void;
}) => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState(initialUserCreateErrorsFirstForm);

  const handleContinue = () => {
    // Clear errors to start off with
    //@ts-ignore
    const { email, password, confirmPassword, ..._ } = formData;

    const parsedValue = zod.safeParse(UserCreateFirstFormTemplate, {
      email,
      password,
      confirmPassword,
    });

    if (!parsedValue.success) {
      const errorObj = { email: "", password: "", confirmPassword: "" };
      for (const issue of parsedValue.error.issues) {
        errorObj[issue.path[0] as keyof typeof errorObj] = issue.message;
      }
      setErrors({
        ...errorObj,
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({
        // Since we passed the rest of the validation, we can clear the rest of the errors
        ...initialUserCreateErrorsFirstForm,
        confirmPassword: "Password is not the same.",
      });
      return;
    }

    // If got here, we're good on validation, send them on
    setFormStep(1);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Register to get started!</p>
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
          <div>
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
            {errors.email && <p className="input-error">{errors.email}</p>}
          </div>
          <div>
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
            {errors.password && (
              <p className="input-error">{errors.password}</p>
            )}
          </div>
          <div>
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
            {errors.confirmPassword && (
              <p className="input-error">{errors.confirmPassword}</p>
            )}
          </div>
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
