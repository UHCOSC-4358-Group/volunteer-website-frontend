import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import SignupFirstForm from "./SignupFirstForm";
import SignupSecondForm from "./SignupSecondForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/UserContext";
import { API_BASE_URL } from "../../config/api";

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

//admin_str
// {
//   "email": "user@example.com",
//   "password": "stringst",
//   "first_name": "string",
//   "last_name": "string",
//   "description": "stringstri",
//   "date_of_birth": "2025-11-14"
// }
//image

//vol_str
// {
//   "skills": [
//     "string"
//   ],
//   "date_of_birth": "2025-11-14",
//   "available_times": [
//     {
//       "day": 1,
//       "end": "12:00",
//       "start": "09:00"
//     },
//     {
//       "day": 5,
//       "end": "16:30",
//       "start": "13:00"
//     }
//   ],
//   "last_name": "string",
//   "location": "string",
//   "first_name": "string",
//   "password": "stringst",
//   "email": "user@example.com",
//   "description": "stringstri"
// }
//image

interface DynamicObject {
  [key: string]: any;
}

const volunteerIntoFormData = (userObj: UserCreateForm) => {
  const formData = new FormData();

  const {
    availability,
    imagePreview,
    image,
    zipCode,
    address,
    country,
    state,
    city,
    confirmPassword,
    role,
    ...volunteerObj
  } = userObj;

  const JSONRequestBody: DynamicObject = {
    first_name: volunteerObj.firstName,
    last_name: volunteerObj.lastName,
    email: volunteerObj.email,
    password: volunteerObj.password,
    description: volunteerObj.description,
    date_of_birth: volunteerObj.dateOfBirth,
    location: {
      address,
      city,
      state,
      country,
      zip_code: zipCode,
    },
    skills: volunteerObj.skills,
    available_times: availability.map((time) => ({
      day: time.dayOfWeek,
      start: time.startTime,
      end: time.endTime,
    })),
  };

  formData.set("vol_data", JSON.stringify(JSONRequestBody));

  if (image) {
    formData.set("image", image);
  }

  return formData;
};

const adminIntoFormData = (userObj: UserCreateForm) => {
  const formData = new FormData();

  const {
    firstName,
    lastName,
    email,
    password,
    description,
    dateOfBirth,
    image,
  } = userObj;

  const JSONRequestBody = {
    first_name: firstName,
    last_name: lastName,
    email,
    password,
    description,
    date_of_birth: dateOfBirth,
  };

  formData.set("admin_data", JSON.stringify(JSONRequestBody));
  if (image) {
    formData.set("image", image);
  }

  return formData;
};

export const Signup = () => {
  const [formStep, setFormStep] = useState(0);
  const { formData, dispatch } = useFormReducer(initialUserCreateForm);
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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

  const registerVolunteer = async (userData: UserCreateForm) => {
    const formObj = volunteerIntoFormData(userData);

    const response = await fetch(`${API_BASE_URL}/auth/vol/signup`, {
      method: "POST",
      body: formObj,
    });

    const content = await response.json();

    if (content.error) {
      throw Error(content.error.message);
    }

    const userInfo = content.user_info;
    const token = content.token;

    login(
      {
        id: userInfo.id,
        role: userInfo.user_type,
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        image_url: userInfo.image_url,
        email: userInfo.email,
        name: `${userInfo.first_name} ${userInfo.last_name}`,
      },
      token
    );
  };

  const registerAdmin = async (userData: UserCreateForm) => {
    const formObj = adminIntoFormData(userData);

    const response = await fetch(`${API_BASE_URL}/auth/org/signup`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formObj,
    });

    const content = await response.json();

    console.log(content);

    if (content.error) {
      throw Error(content.error.message);
    }

    const userInfo = content.user_info;
    const token = content.token;

    login(
      {
        id: userInfo.id,
        role: userInfo.user_type,
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        image_url: userInfo.image_url,
        email: userInfo.email,
        name: `${userInfo.first_name} ${userInfo.last_name}`,
      },
      token
    );
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      if (formData.role == "volunteer") {
        await registerVolunteer(formData);
        navigate("/volunteer-profile");
      } else {
        await registerAdmin(formData);
        navigate("/OrgDashboard");
      }
    } catch (error) {
      alert(error);
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
