import React, { FormEvent, useState } from "react";
import { FormInput } from "./SignupSecondForm";
import type { UserCreateForm } from "./Signup";

enum DayofWeek {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}

function TimeField({
  selectedDayValue = null,
  selectedStartTime = null,
  selectedEndTime = null,
  handleDayChange,
  handleStartTimeChange,
  handleEndTimeChange,
  index,
}: {
  selectedDayValue: DayofWeek | null;
  selectedStartTime: string | null;
  selectedEndTime: string | null;
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
  index: number;
}) {
  return (
    <div className="flex justify-around gap-4 flex-col md:flex-row">
      <div>
        <label htmlFor="dayOfWeek">Day of the Week:</label>
        <select
          id="dayOfWeek"
          name="dayOfWeek"
          value={selectedDayValue ? selectedDayValue : undefined}
          onChange={(e) => handleDayChange(e, index)}
          className="w-full p-2 rounded border focus:outline-none focus:ring-2 border-mint"
        >
          <option value={-1}>Select a day</option>
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
          value={selectedStartTime || undefined}
          onChange={(e) => handleStartTimeChange(e, index)}
          className="w-full p-2 rounded border focus:outline-none focus:ring-2 border-mint"
        ></input>
      </div>
      <div>
        <label htmlFor="endTime">End Time:</label>
        <input
          id="endTime"
          name="endTime"
          type="time"
          value={selectedEndTime || undefined}
          onChange={(e) => handleEndTimeChange(e, index)}
          className="w-full p-2 rounded border focus:outline-none focus:ring-2 border-mint"
        ></input>
      </div>
    </div>
  );
}

function VolunteerSignupForm({
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
  const [newSkill, setNewSkill] = useState("");

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
          <FormInput
            type="textarea"
            name="description"
            currentValue={formData.description}
            labelText="Add a profile description:"
            colspan={2}
            required
            handler={handleTextChange}
          />
          <div className="md:col-span-2">
            <label
              htmlFor="skills"
              className="text-navy block font-semibold mb-1"
            >
              Skills *
            </label>
            <select
              id="skills"
              multiple
              // onChange={(e) => }
              className="w-full p-2 rounded border h-28 focus:outline-none focus:ring-2 border-mint"
              // style={{
              //   borderColor: errors.skills ? "#ef4444" : PALETTE.mint,
              //   borderWidth: errors.skills ? "2px" : "1px",
              // }}
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
            {/* {errors.skills && (
              <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                {errors.skills}
              </p>
            )} */}
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
            <fieldset className="text-navy font-semibold">
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
                    index={idx}
                    key={idx}
                  />
                );
              })}
            </fieldset>
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
            type="submit"
            onSubmit={handleSubmit}
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
