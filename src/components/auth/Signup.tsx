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
  NULL = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}

export interface TimeAvailable {
  dayOfWeek: DayofWeek;
  startTime: string;
  endTime: string;
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
  availability: TimeAvailable[];
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
  availability: [],
};

interface UserCreateErrorsSecondForm {
  firstName: string;
  lastName: string;
  description: string;
  dateOfBirth: string;
  city: string;
  state: string;
  country: string;
  address: string;
  zipCode: string;
  skills: string;
  availability: string;
}

const initialUserCreateErrorsSecondForm: UserCreateErrorsSecondForm = {
  firstName: "",
  lastName: "",
  description: "",
  dateOfBirth: "",
  city: "",
  state: "",
  country: "",
  address: "",
  zipCode: "",
  skills: "",
  availability: "",
};

// These apply to both admins and volunteers
const UserCreateSecondFormTemplate = {
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
};

const AdminCreateZodForm = zod.object({
  ...UserCreateSecondFormTemplate,
});

// Here we add some additional fields for skills and availability
const VolunteerCreateZodForm = zod.object({
  ...UserCreateSecondFormTemplate,
  skills: zod.array(zod.string()),
  availability: zod.array(
    zod.object({
      dayOfWeek: zod.number().gt(0, "You must select a day"),
      startTime: zod.string(),
      endTime: zod.string(),
    })
  ),
});

export const Signup: React.FC = () => {
  const [formStep, setFormStep] = useState(0);
  const { formData, dispatch } = useFormReducer(initialUserCreateForm);
  const [loading, setLoading] = useState<boolean>(false);
  const handleTextChange = (
    e:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLSelectElement>
      | ChangeEvent<HTMLTextAreaElement>
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

  const handleNewAvailabilityAddition = () => {
    dispatch({
      type: FormReducerActionTypes.ADD_TIME_TO_ARRAY,
      field: "availability",
      payload: "",
    });
  };

  const handleDayChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number
  ) => {
    dispatch({
      type: FormReducerActionTypes.EDIT_ARRAY_OBJ,
      field: "availability",
      payload: `${index} ${e.target.name} ${e.target.value}`,
    });
  };

  const handleStartTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    dispatch({
      type: FormReducerActionTypes.EDIT_ARRAY_OBJ,
      field: "availability",
      payload: `${index} ${e.target.name} ${e.target.value}`,
    });
  };

  const handleEndTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    dispatch({
      type: FormReducerActionTypes.EDIT_ARRAY_OBJ,
      field: "availability",
      payload: `${index} ${e.target.name} ${e.target.value}`,
    });
  };

  const registerVolunteer = async (userData: UserCreateForm) => {
    console.log("Registering user:", userData);

    const parsedValue = zod.safeParse(VolunteerCreateZodForm, userData);

    if (parsedValue.success) {
      console.log("SUCCESS");
    } else {
      console.log("FAILURE");
      const errors = parsedValue.error;
      console.log(errors);
    }

    return Promise.resolve();
  };

  const registerAdmin = async (userData: UserCreateForm) => {
    console.log("Registering user:", userData);

    // Removes skills and availability from userData, creating the admin object
    const { skills, availability, ...adminData } = userData;

    const parsedValue = zod.safeParse(AdminCreateZodForm, adminData);

    if (!parsedValue.success) {
      console.log("FAILURE");
      const errors = parsedValue.error;
      console.log(errors);
    }

    return Promise.resolve();
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      if (formData.role == "volunteer") {
        await registerVolunteer(formData);
      } else {
        await registerAdmin(formData);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const multiStepFormList = [
    <SignupFirstForm
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
      handleNewAvailabilityAddition={handleNewAvailabilityAddition}
      handleDayChange={handleDayChange}
      handleStartTimeChange={handleStartTimeChange}
      handleEndTimeChange={handleEndTimeChange}
      formData={formData}
      setFormStep={setFormStep}
    />,
  ];

  return <form onSubmit={handleSubmit}>{multiStepFormList[formStep]}</form>;
};
