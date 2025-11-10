import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import SignupFirstForm from "./SignupFirstForm";
import SignupSecondForm from "./SignupSecondForm";
import * as zod from "zod";

import {
  useFormReducer,
  FormReducerActionTypes,
} from "../../hooks/form-reducer";
import "./SignIn.css";

// Have to re-declare in VolunteerSignup for hot-module-replacement compat
enum DayofWeek {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}

export interface TimeAvailable {
  dayOfWeek: DayofWeek | null;
  startTime: string | null;
  endTime: string | null;
}

export interface UserCreateForm {
  role: "volunteer" | "organizer";
  email: string;
  password: string;
  confirmPassword: string;
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
  availabilty: TimeAvailable[];
}

const initialUserCreateForm: UserCreateForm = {
  role: "volunteer",
  email: "",
  password: "",
  confirmPassword: "",
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
  availabilty: [],
};

const UserCreateTemplate = {
  email: zod.email("Email format is not valid."),
  password: zod.string().min(8, "Password must be 8 characters or longer"),
  firstName: zod.string().min(1, "First name cannot be empty.").toUpperCase(),
  lastName: zod.string().min(1, "Last name cannot be empty.").toUpperCase(),
  description: zod
    .string()
    .min(15, "Description must be 15 characters or longer."),
  dateOfBirth: zod.date("Date must be filled in."),
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
};

const AdminCreateZodForm = zod.object({
  ...UserCreateTemplate,
});

const VolunteerCreateZodForm = zod.object({
  ...UserCreateTemplate,
});

export const Signup: React.FC = () => {
  const [formStep, setFormStep] = useState(0);
  const { formData, dispatch } = useFormReducer(initialUserCreateForm);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleTextChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    dispatch({
      type: FormReducerActionTypes.CHANGE_TEXT,
      field: e.target.name,
      payload: e.target.value,
    });
  };

  const handleRoleChange = (role: "volunteer" | "organizer") => {
    dispatch({
      type: FormReducerActionTypes.CHANGE_ROLE,
      field: "",
      payload: role,
    });
  };

  const handleSkillAddition = (newSkill: string) => {
    dispatch({
      type: FormReducerActionTypes.APPEND_ARRAY,
      field: "skills",
      payload: newSkill,
    });
  };

  const handleSkillsDeletion = (skillToDelete: string) => {
    dispatch({
      type: FormReducerActionTypes.DEDUCT_ARRAY,
      field: "skills",
      payload: skillToDelete,
    });
  };

  const handleNewAvailabiltyAddition = () => {
    dispatch({
      type: FormReducerActionTypes.ADD_TIME_TO_ARRAY,
      field: "availabilty",
      payload: "",
    });
  };

  const handleDayChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number
  ) => {
    dispatch({
      type: FormReducerActionTypes.EDIT_ARRAY_OBJ,
      field: "availabilty",
      payload: `${index} ${e.target.name} ${e.target.value}`,
    });
  };

  const handleStartTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    dispatch({
      type: FormReducerActionTypes.EDIT_ARRAY_OBJ,
      field: "availabilty",
      payload: `${index} ${e.target.name} ${e.target.value}`,
    });
  };

  const handleEndTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    dispatch({
      type: FormReducerActionTypes.EDIT_ARRAY_OBJ,
      field: "availabilty",
      payload: `${index} ${e.target.name} ${e.target.value}`,
    });
  };

  const registerUser = async (userData: UserCreateForm): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Registering user:", userData);

    return Promise.resolve();
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
  };

  const multiStepFormList = [
    <SignupFirstForm
      errors={errors}
      handleTextChange={handleTextChange}
      formData={formData}
      setFormStep={setFormStep}
      handleRoleChange={handleRoleChange}
    />,
    <SignupSecondForm
      loading={loading}
      handleSubmit={handleSubmit}
      handleTextChange={handleTextChange}
      handleSkillsAddition={handleSkillAddition}
      handleSkillsDeletion={handleSkillsDeletion}
      handleNewAvailabiltyAddition={handleNewAvailabiltyAddition}
      handleDayChange={handleDayChange}
      handleStartTimeChange={handleStartTimeChange}
      handleEndTimeChange={handleEndTimeChange}
      formData={formData}
      setFormStep={setFormStep}
    />,
  ];

  return <form onSubmit={handleSubmit}>{multiStepFormList[formStep]}</form>;
};
