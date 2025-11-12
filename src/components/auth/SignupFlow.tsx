import { useState, FormEvent } from "react";
import SignupFirstForm from "./SignupFirstForm";
import SignupSecondForm from "./SignupSecondForm";
import { UserCreateForm, TimeAvailable} from "./Signup";

// Import TimeAvailable from Signup instead of redefining it

const SignupFlow = () => {
  const [formStep, setFormStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserCreateForm>({
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
    availability: []
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement> | 
      React.ChangeEvent<HTMLSelectElement> | 
      React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (role: "volunteer" | "organizer") => {
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  const handleSkillsAddition = (newSkill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
  };

  const handleSkillsDeletion = (skillToDelete: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToDelete)
    }));
  };

    const handleNewAvailabilityAddition = () => {
        const newTimeSlot: TimeAvailable = {
        dayOfWeek: 0,
        startTime: "", 
        endTime: ""
        };
        
        setFormData(prev => ({
        ...prev,
        availability: [...prev.availability, newTimeSlot]
        }));
    };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
    const newAvailability = [...formData.availability];
        newAvailability[index] = { 
            ...newAvailability[index], 
            dayOfWeek: Number(e.target.value) // Convert string to number since DayofWeek is an enum
        };
        setFormData(prev => ({ ...prev, availability: newAvailability }));
    };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newAvailability = [...formData.availability];
    newAvailability[index] = { ...newAvailability[index], startTime: e.target.value };
    setFormData(prev => ({ ...prev, availability: newAvailability }));
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newAvailability = [...formData.availability];
    newAvailability[index] = { ...newAvailability[index], endTime: e.target.value };
    setFormData(prev => ({ ...prev, availability: newAvailability }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Add your form submission logic here
      console.log('Submitting form data:', formData);
      // Make API call to submit the form
      
      // If successful, you might want to redirect
      // navigate('/success-page');
    } catch (error) {
      console.error('Submission error:', error);
      setErrors(['Failed to submit form. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  // Render the appropriate form step
  if (formStep === 0) {
    return (
      <SignupFirstForm
        errors={errors}
        handleTextChange={handleTextChange}
        formData={formData}
        setFormStep={setFormStep}
        handleRoleChange={handleRoleChange}
      />
    );
  } else if (formStep === 1) {
    return (
      <SignupSecondForm
        loading={loading}
        handleSubmit={handleSubmit}
        handleTextChange={handleTextChange}
        handleSkillsAddition={handleSkillsAddition}
        handleSkillsDeletion={handleSkillsDeletion}
        handleNewAvailabilityAddition={handleNewAvailabilityAddition}
        handleDayChange={handleDayChange}
        handleStartTimeChange={handleStartTimeChange}
        handleEndTimeChange={handleEndTimeChange}
        formData={formData}
        setFormStep={setFormStep}
      />
    );
  }

  return null;
};

export default SignupFlow;