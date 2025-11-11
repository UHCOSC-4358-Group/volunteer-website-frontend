import AdminSignupForm from "./AdminSignupForm";
import type { UserCreateForm } from "./Signup";
import SelectStateOptions from "../SelectStateOptions";
import VolunteerSignupForm from "./VolunteerSignupForm";
import { FormEvent } from "react";

export function FormInput({
  type,
  name,
  labelText,
  colspan = 1,
  currentValue,
  placeholder = "",
  required = false,
  disabled = false,
  handler,
}: {
  type: string;
  name: string;
  labelText: string;
  colspan?: number;
  currentValue: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  handler: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
}) {
  let inputComponent: React.ReactNode;

  if (type === "select") {
    inputComponent = (
      <select
        id={name}
        name={name}
        required={required}
        disabled={disabled}
        onChange={handler}
        value={currentValue}
        className={`w-full p-2 rounded border focus:outline-none focus:ring-2 border-mint ${
          disabled && "bg-gray-200"
        }`}
        // style={{
        //   borderColor: errors.state ? "#ef4444" : PALETTE.mint,
        //   borderWidth: errors.state ? "2px" : "1px",
        // }}
      >
        <SelectStateOptions />
      </select>
    );
  } else if (type === "textarea") {
    inputComponent = (
      <textarea
        id={name}
        name={name}
        required={required}
        disabled={disabled}
        onChange={handler}
        value={currentValue}
        className={`w-full p-2 rounded border focus:outline-none focus:ring-2 border-mint ${
          disabled && "bg-gray-200"
        }`}
      ></textarea>
    );
  } else {
    inputComponent = (
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        disabled={disabled}
        onChange={handler}
        value={currentValue}
        placeholder={placeholder}
        className={`w-full p-2 rounded border focus:outline-none focus:ring-2 border-mint ${
          disabled && "bg-gray-200"
        }`}
        // style={{
        //   borderColor: error ? "#ef4444" : PALETTE.mint,
        //   borderWidth: error ? "2px" : "1px",
        // }}
      />
    );
  }

  return (
    // Span two on bigger screens
    <div className={`md:col-span-${colspan}`}>
      <label htmlFor={name} className="block font-semibold mb-1 text-navy">
        {labelText}
        <span className="text-[#ef4444]">{required && " *"}</span>
      </label>
      {inputComponent}
      {/* <p className="text-sm mt-1 text-[#ef4444]">{"hello"}</p> */}
    </div>
  );
}

const SignupSecondForm = ({
  loading,
  handleSubmit,
  handleTextChange,
  handleSkillsAddition,
  handleSkillsDeletion,
  handleNewAvailabilityAddition,
  handleDayChange,
  handleStartTimeChange,
  handleEndTimeChange,
  formData,
  setFormStep,
}: {
  loading: boolean;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleTextChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleSkillsAddition: (newSkill: string) => void;
  handleSkillsDeletion: (skillToDelete: string) => void;
  handleNewAvailabilityAddition: () => void;
  handleDayChange: (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number
  ) => void;
  handleStartTimeChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => void;
  handleEndTimeChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => void;
  formData: UserCreateForm;
  setFormStep: React.Dispatch<React.SetStateAction<number>>;
}) => {
  if (formData.role == "volunteer") {
    return (
      <VolunteerSignupForm
        loading={loading}
        handleSubmit={handleSubmit}
        handleSkillsAddition={handleSkillsAddition}
        handleSkillsDeletion={handleSkillsDeletion}
        handleTextChange={handleTextChange}
        handleNewAvailabilityAddition={handleNewAvailabilityAddition}
        handleDayChange={handleDayChange}
        handleStartTimeChange={handleStartTimeChange}
        handleEndTimeChange={handleEndTimeChange}
        formData={formData}
        setFormStep={setFormStep}
      />
    );
  } else {
    return (
      <AdminSignupForm
        loading={loading}
        handleSubmit={handleSubmit}
        handleTextChange={handleTextChange}
        formData={formData}
        setFormStep={setFormStep}
      />
    );
  }
};

export default SignupSecondForm;
