import React, { useReducer } from "react";
import SelectStateOptions from "./SelectStateOptions";

const PALETTE = {
  navy: "#22577A",
  teal: "#38A3A5",
  green: "#26A96C",
  mint: "#80ED99",
  sand: "#F0EADF",
};

interface AdminCreateForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  description: string;
  dateOfBirth: string;
  city: string;
  state: string;
  country: string;
  address: string;
  zipCode: string;
  skills: string[];
}

function adminCreateFormReducer(
  state: AdminCreateForm,
  action: { type: string; field: string; payload: string | boolean }
) {
  switch (action.type) {
    case "CHANGE_TEXT":
      return {
        ...state,
        [action.field]: action.payload,
      };
    case "CLEAR_FORM":
      return { ...initialAdminCreateFormState };
    default:
      return state;
  }
}

function FormInput({
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
        className={`w-full p-2 rounded border focus:outline-none focus:ring-2 ${
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
        className={`w-full p-2 rounded border focus:outline-none focus:ring-2 ${
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
    <div className={`col-span-${colspan}`}>
      <label
        htmlFor={name}
        className="block font-semibold mb-1"
        style={{ color: PALETTE.navy }}
      >
        {labelText}
        <span className="text-red-400">{required && " *"}</span>
      </label>
      {inputComponent}
      {/* <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
        {"hello"}
      </p> */}
    </div>
  );
}

const initialAdminCreateFormState: AdminCreateForm = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  description: "",
  dateOfBirth: "",
  city: "",
  state: "",
  country: "United States",
  address: "",
  zipCode: "",
  skills: [],
};

function AdminCreate() {
  const [formData, dispatch] = useReducer(
    adminCreateFormReducer,
    initialAdminCreateFormState
  );

  const handleTextChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    console.log([e.target.name, e.target.value]);

    dispatch({
      type: "CHANGE_TEXT",
      field: e.target.name,
      payload: e.target.value,
    });
  };

  const handleClear = () => {
    dispatch({
      type: "CLEAR_FORM",
      field: "",
      payload: "",
    });
  };

  // const [loading, setLoading] = useState(false);

  function handleSubmit() {
    console.log("Doing some work!");
  }
  return (
    <div
      className="min-h-screen flex justify-center items-center p-6"
      style={{ backgroundColor: PALETTE.sand }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl p-8 rounded-2xl shadow-md"
        style={{
          backgroundColor: "#fff",
          borderTop: `6px solid ${PALETTE.teal}`,
        }}
      >
        <h2
          className="text-2xl font-bold mb-1 text-center"
          style={{ color: PALETTE.navy }}
        >
          Admin Profile Information
        </h2>
        <p className="text-sm text-center mb-8" style={{ color: PALETTE.teal }}>
          required: <span className="text-red-400">*</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormInput
            type="text"
            name="firstName"
            currentValue={formData.firstName}
            labelText="First Name:"
            required
            handler={(e) => handleTextChange(e)}
          />
          <FormInput
            type="text"
            name="lastName"
            currentValue={formData.lastName}
            labelText="Last Name:"
            required
            handler={(e) => handleTextChange(e)}
          />
          <FormInput
            type="date"
            name="dateOfBirth"
            currentValue={formData.dateOfBirth}
            labelText="Date of Birth:"
            required
            handler={(e) => handleTextChange(e)}
          />

          <FormInput
            type="text"
            name="address"
            currentValue={formData.address}
            labelText="Address:"
            required
            handler={(e) => handleTextChange(e)}
          />

          <FormInput
            type="text"
            name="country"
            currentValue={formData.country}
            labelText="Country:"
            required
            disabled
            handler={(e) => handleTextChange(e)}
          />

          <FormInput
            type="select"
            name="state"
            currentValue={formData.state}
            labelText="State:"
            required
            handler={(e) => handleTextChange(e)}
          />

          <FormInput
            type="text"
            name="city"
            currentValue={formData.city}
            labelText="City:"
            required
            handler={(e) => handleTextChange(e)}
          />

          <FormInput
            type="text"
            name="zipCode"
            currentValue={formData.zipCode}
            labelText="Zip Code:"
            required
            handler={(e) => handleTextChange(e)}
          />
        </div>

        <div className="flex justify-around items-center mt-12">
          <button
            type="button"
            className="font-semibold py-2 px-8 rounded-full shadow-md transition-transform hover:scale-105"
            style={{ backgroundColor: PALETTE.sand, color: "black" }}
            onClick={() => handleClear()}
          >
            Clear Profile
          </button>
          <button
            type="submit"
            // disabled={loading}
            className="font-semibold py-2 px-8 rounded-full shadow-md transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: PALETTE.teal, color: "white" }}
          >
            {/* {loading ? "Saving..." : "Save Profile"} */}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminCreate;
