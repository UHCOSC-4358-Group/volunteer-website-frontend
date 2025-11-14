import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import SignupFirstForm from "./SignupFirstForm";
import SignupSecondForm from "./SignupSecondForm";

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
  image: File | null;
  imagePreview: string;
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
  image: null,
  imagePreview: "",
  skills: [],
  availability: [],
};

export const Signup: React.FC = () => {
  const [formStep, setFormStep] = useState(0);
  const { formData, dispatch } = useFormReducer(initialUserCreateForm);
  const [loading, setLoading] = useState<boolean>(false);

  // For deleting images once they change
  useEffect(() => {
    return () => {
      if (formData.imagePreview) {
        URL.revokeObjectURL(formData.imagePreview);
      }
    };
  }, [formData.imagePreview]);

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

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    dispatch({
      type: FormReducerActionTypes.UPLOAD_FILE,
      field: e.target.name,
      payload: "",
      file,
    });

    if (file) {
      const previewURL = URL.createObjectURL(file);
      dispatch({
        type: FormReducerActionTypes.CHANGE_TEXT,
        field: "imagePreview",
        payload: previewURL,
      });
    }
  };

  const handleFileRemoval = () => {
    dispatch({
      type: FormReducerActionTypes.CLEAR_FILE,
      field: "",
      payload: "",
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

  const registerVolunteer = async (volunteerData: UserCreateForm) => {
    console.log("Registering user:", volunteerData);

    return Promise.resolve();
  };

  const registerAdmin = async (userData: UserCreateForm) => {
    console.log("Registering user:", userData);

    const { skills, availability, ...adminData } = userData;

    console.log(adminData);

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
      handleFileUpload={handleFileUpload}
      handleFileRemoval={handleFileRemoval}
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

  return <form>{multiStepFormList[formStep]}</form>;
};
