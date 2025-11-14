import React, { FormEvent, useState } from "react";
import * as zod from "zod";
import { FormInput } from "./SignupSecondForm";
import type { UserCreateForm } from "./Signup";

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

const initialVolunteerCreateErrorsSecondForm = {
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

const getAge = (date: Date) => {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const month = today.getMonth() - date.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < date.getDate())) {
    age--;
  }

  return age;
};

const getTime = (timeString: string) => {
  const [startHours, startMinutes] = timeString
    .split(":")
    .map((v) => Number(v));
  const time = new Date();
  time.setHours(startHours, startMinutes);

  return time;
};

// These apply to both admins and volunteers
const VolunteerCreateSecondFormTemplate = zod.object({
  firstName: zod.string().min(1, "First name cannot be empty.").toUpperCase(),
  lastName: zod.string().min(1, "Last name cannot be empty.").toUpperCase(),
  description: zod
    .string()
    .min(5, "Description must be 5 characters or longer."),
  dateOfBirth: zod.coerce
    .date("Date cannot be empty.")
    .refine((date) => getAge(date) >= 18, "User must be 18 years or older"),
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
  skills: zod.array(zod.string()),
  availability: zod.array(
    zod
      .object({
        dayOfWeek: zod.number().gt(0, "You must select a day"),
        startTime: zod.string().nonempty("You must select a start time"),
        endTime: zod.string().nonempty("You must select an end time"),
      })
      .refine((avail) => getTime(avail.startTime) < getTime(avail.endTime), {
        error: "Start time cannot be before or on end time.",
        path: ["availability"],
      })
  ),
});

function TimeField({
  selectedDayValue,
  selectedStartTime,
  selectedEndTime,
  handleDayChange,
  handleStartTimeChange,
  handleEndTimeChange,
  error,
  index,
}: {
  selectedDayValue: DayofWeek;
  selectedStartTime: string;
  selectedEndTime: string;
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
  error: string;
  index: number;
}) {
  return (
    <div className="flex justify-around gap-4 flex-col md:flex-row">
      <div>
        <label htmlFor="dayOfWeek">Day of the Week:</label>
        <select
          id="dayOfWeek"
          name="dayOfWeek"
          value={selectedDayValue}
          onChange={(e) => handleDayChange(e, index)}
          className={`w-full p-2 rounded border focus:outline-none focus:ring-2 ${
            error ? "border-red-600 border-2" : "border-mint border-1"
          }`}
        >
          <option value={DayofWeek.NULL}>Select a day</option>
          <option value={DayofWeek.MONDAY}>Monday</option>
          <option value={DayofWeek.TUESDAY}>Tuesday</option>
          <option value={DayofWeek.WEDNESDAY}>Wednesday</option>
          <option value={DayofWeek.THURSDAY}>Thursday</option>
          <option value={DayofWeek.FRIDAY}>Friday</option>
          <option value={DayofWeek.SATURDAY}>Saturday</option>
          <option value={DayofWeek.SUNDAY}>Sunday</option>
        </select>
      </div>
      <div>
        <label htmlFor="startTime">Start Time:</label>
        <input
          id="startTime"
          name="startTime"
          type="time"
          value={selectedStartTime}
          onChange={(e) => handleStartTimeChange(e, index)}
          className={`w-full p-2 rounded border focus:outline-none focus:ring-2 ${
            error ? "border-red-600 border-2" : "border-mint border-1"
          }`}
        ></input>
      </div>
      <div>
        <label htmlFor="endTime">End Time:</label>
        <input
          id="endTime"
          name="endTime"
          type="time"
          value={selectedEndTime}
          onChange={(e) => handleEndTimeChange(e, index)}
          className={`w-full p-2 rounded border focus:outline-none focus:ring-2 ${
            error ? "border-red-600 border-2" : "border-mint border-1"
          }`}
        ></input>
      </div>
    </div>
  );
}

function VolunteerSignupForm({
  loading,
  handleSubmit,
  handleTextChange,
  handleFileUpload,
  handleFileRemoval,
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
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileRemoval: () => void;
  handleSkillsAddition: (newSkill: string) => void;
  handleSkillsDeletion: (newSkill: string) => void;
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
}) {
  const handleValidation = (e: FormEvent) => {
    e.preventDefault();

    const parsedValue = VolunteerCreateSecondFormTemplate.safeParse(formData);

    if (!parsedValue.success) {
      const issuesObj = structuredClone(initialVolunteerCreateErrorsSecondForm);
      for (const issue of parsedValue.error.issues) {
        issuesObj[issue.path[0] as keyof typeof issuesObj] = issue.message;
      }
      setErrors({ ...issuesObj });
      return;
    }

    handleSubmit(e);
  };

  const [newSkill, setNewSkill] = useState("");
  const [errors, setErrors] = useState(initialVolunteerCreateErrorsSecondForm);

  return (
    <div className="bg-sand min-h-screen flex justify-center items-center p-6">
      <div className="w-full max-w-4xl p-8 rounded-2xl shadow-md bg-[#fff] border-t-6 border-t-teal">
        <h2 className="text-2xl font-bold mb-1 text-center text-navy">
          Volunteer Profile Information
        </h2>
        <p className="text-sm text-center mb-8 text-teal">required: </p>

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
          <div className="md:col-span-2 flex flex-col items-center justify-center">
            <label
              htmlFor="image"
              className="text-navy block font-semibold p-2"
            >
              Enter your picture:
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              className=""
              onChange={handleFileUpload}
            />
            {formData.imagePreview && (
              <>
                <img
                  src={formData.imagePreview}
                  alt="Profile picture preview"
                  className="w-[400px] h-auto m-5 border-navy border-5"
                />
                <button
                  className="bg-teal text-white mt-2 font-semibold py-2 px-4 rounded-full shadow-md transition-transform hover:scale-105"
                  type="button"
                  onClick={handleFileRemoval}
                >
                  Remove
                </button>
              </>
            )}
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="skills"
              className="text-navy block font-semibold mb-1"
            >
              Skills:
            </label>
            <select
              id="skills"
              multiple
              className={`w-full p-2 rounded border focus:outline-none focus:ring-2 ${
                errors.skills
                  ? "border-red-600 border-2"
                  : "border-mint border-1"
              }`}
            >
              {formData.skills.map((skill, idx) => {
                return (
                  <option
                    value={skill}
                    key={idx}
                    onClick={(e) =>
                      e.shiftKey ? handleSkillsDeletion(skill) : null
                    }
                  >
                    {skill}
                  </option>
                );
              })}
            </select>
            <p className="text-xs mt-1 text-teal">
              Hold Shift and left click a skill to delete it.
            </p>
            {errors.skills && (
              <p className="text-sm mt-1 text-red-600">{errors.skills}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="newSkill"
              className="text-navy block font-semibold mb-1"
            >
              Add New Skill
            </label>
            <input
              id="newSkill"
              type="text"
              maxLength={50}
              className="border-mint w-full p-2 rounded border focus:outline-none focus:ring-2"
              placeholder="Enter a new skill"
              onChange={(e) => setNewSkill(e.target.value)}
            />
            <button
              type="button"
              className="bg-teal text-white mt-2 font-semibold py-2 px-4 rounded-full shadow-md transition-transform hover:scale-105"
              onClick={() => handleSkillsAddition(newSkill)}
            >
              Add Skill
            </button>
          </div>

          <div className="md:col-span-2">
            <fieldset className="text-navy font-semibold flex flex-col gap-2">
              <legend className="p-4">Indicate your availability:</legend>
              {formData.availability.map((timeAvailable, idx) => {
                return (
                  <TimeField
                    selectedDayValue={timeAvailable.dayOfWeek}
                    selectedStartTime={timeAvailable.startTime}
                    selectedEndTime={timeAvailable.endTime}
                    handleDayChange={handleDayChange}
                    handleStartTimeChange={handleStartTimeChange}
                    handleEndTimeChange={handleEndTimeChange}
                    error={errors.availability}
                    index={idx}
                    key={idx}
                  />
                );
              })}
            </fieldset>
            {errors.availability && (
              <p className="text-sm mt-1 text-red-600">{errors.availability}</p>
            )}
            <button
              type="button"
              className="bg-teal text-white mt-2 font-semibold py-2 px-4 rounded-full shadow-md transition-transform hover:scale-105"
              onClick={handleNewAvailabilityAddition}
            >
              Add Time
            </button>
          </div>
        </div>

        <div className="flex justify-around mt-8">
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
            disabled={loading}
            className="bg-teal text-white font-semibold py-2 px-8 rounded-full shadow-md transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default VolunteerSignupForm;
