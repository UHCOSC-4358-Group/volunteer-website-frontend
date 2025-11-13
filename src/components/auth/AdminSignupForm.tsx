import React, { FormEvent, useState } from "react";
import { FormInput } from "./SignupSecondForm";
import type { UserCreateForm } from "./Signup";
import * as zod from "zod";

const initialUserCreateErrorsSecondForm = {
  firstName: "",
  lastName: "",
  description: "",
  dateOfBirth: "",
  city: "",
  state: "",
  country: "",
  address: "",
  zipCode: "",
};

const AdminCreateZodForm = zod.object({
  firstName: zod.string().min(1, "First name cannot be empty.").toUpperCase(),
  lastName: zod.string().min(1, "Last name cannot be empty.").toUpperCase(),
  description: zod
    .string()
    .min(5, "Description must be 5 characters or longer."),
  dateOfBirth: zod.coerce.date("Date cannot be empty."),
  country: zod.string().min(1, "Country cannot be empty."),
  state: zod.string().min(1, "State cannot be empty."),
  city: zod.string().min(1, "City cannot be empty."),
  address: zod.string().min(1, "Address cannot be empty"),
  zipCode: zod
    .string()
    .regex(
      /^\d{5}(?:[-\s]\d{4})?$/,
      "Zip code is not correct format. (12345[-6789])"
    ),
});

function AdminSignupForm({
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
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  formData: UserCreateForm;
  setFormStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [errors, setErrors] = useState(initialUserCreateErrorsSecondForm);

  const handleValidation = (e: FormEvent) => {
    const parsedValue = AdminCreateZodForm.safeParse(formData);

    if (!parsedValue.success) {
      const issuesObj = structuredClone(initialUserCreateErrorsSecondForm);
      for (const issue of parsedValue.error.issues) {
        issuesObj[issue.path[0] as keyof typeof issuesObj] = issue.message;
      }
      setErrors({ ...issuesObj });
      return;
    }

    handleSubmit(e);
  };

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
            error={errors.firstName}
            required
            handler={handleTextChange}
          />
          <FormInput
            type="text"
            name="lastName"
            currentValue={formData.lastName}
            labelText="Last Name:"
            error={errors.lastName}
            required
            handler={handleTextChange}
          />
          <FormInput
            type="date"
            name="dateOfBirth"
            currentValue={formData.dateOfBirth}
            labelText="Date of Birth:"
            error={errors.dateOfBirth}
            required
            handler={handleTextChange}
          />

          <FormInput
            type="text"
            name="address"
            currentValue={formData.address}
            labelText="Address:"
            error={errors.address}
            required
            handler={handleTextChange}
          />

          <FormInput
            type="text"
            name="country"
            currentValue={formData.country}
            labelText="Country:"
            error={errors.country}
            required
            disabled
            handler={handleTextChange}
          />

          <FormInput
            type="select"
            name="state"
            currentValue={formData.state}
            labelText="State:"
            error={errors.state}
            required
            handler={handleTextChange}
          />

          <FormInput
            type="text"
            name="city"
            currentValue={formData.city}
            labelText="City:"
            error={errors.city}
            required
            handler={handleTextChange}
          />

          <FormInput
            type="text"
            name="zipCode"
            currentValue={formData.zipCode}
            labelText="Zip Code:"
            error={errors.zipCode}
            required
            handler={handleTextChange}
          />
          <FormInput
            type="textarea"
            name="description"
            currentValue={formData.description}
            labelText="Add a profile description:"
            error={errors.description}
            colspan={2}
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
            type="button"
            onClick={handleValidation}
            className="bg-teal text-white font-semibold py-2 px-8 rounded-full shadow-md transition-transform hover:scale-105"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminSignupForm;
