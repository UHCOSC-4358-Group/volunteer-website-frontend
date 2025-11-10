import React, { FormEvent } from "react";
import { FormInput } from "./SignupSecondForm";
import type { UserCreateForm } from "./Signup";

function AdminSignupForm({
  loading,
  handleSubmit,
  handleTextChange,
  formData,
  setFormStep,
}: {
  loading: boolean;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleTextChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => void;
  formData: UserCreateForm;
  setFormStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  // const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex justify-center items-center p-6 bg-sand">
      <div className="w-full max-w-4xl p-8 rounded-2xl shadow-md bg-[#fff] border-t-6 border-t-teal">
        <h2 className="text-2xl font-bold mb-1 text-center text-navy">
          Admin Profile Information
        </h2>
        <p className="text-sm text-center mb-8 text-teal">
          required: <span className="text-red-400">*</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormInput
            type="text"
            name="firstName"
            currentValue={formData.firstName}
            labelText="First Name:"
            required
            handler={handleTextChange}
          />
          <FormInput
            type="text"
            name="lastName"
            currentValue={formData.lastName}
            labelText="Last Name:"
            required
            handler={handleTextChange}
          />
          <FormInput
            type="date"
            name="dateOfBirth"
            currentValue={formData.dateOfBirth}
            labelText="Date of Birth:"
            required
            handler={handleTextChange}
          />

          <FormInput
            type="text"
            name="address"
            currentValue={formData.address}
            labelText="Address:"
            required
            handler={handleTextChange}
          />

          <FormInput
            type="text"
            name="country"
            currentValue={formData.country}
            labelText="Country:"
            required
            disabled
            handler={handleTextChange}
          />

          <FormInput
            type="select"
            name="state"
            currentValue={formData.state}
            labelText="State:"
            required
            handler={handleTextChange}
          />

          <FormInput
            type="text"
            name="city"
            currentValue={formData.city}
            labelText="City:"
            required
            handler={handleTextChange}
          />

          <FormInput
            type="text"
            name="zipCode"
            currentValue={formData.zipCode}
            labelText="Zip Code:"
            required
            handler={handleTextChange}
          />
        </div>

        <div className="flex justify-around items-center mt-12">
          <button
            type="button"
            className="bg-sand text-black font-semibold py-2 px-8 rounded-full shadow-md transition-transform hover:scale-105"
            onClick={() => setFormStep(0)}
          >
            Go Back
          </button>
          <button
            type="submit"
            onSubmit={handleSubmit}
            // disabled={loading}
            className="bg-teal text-white font-semibold py-2 px-8 rounded-full shadow-md transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Profile
            {/* {loading ? "Saving..." : "Save Profile"} */}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminSignupForm;
