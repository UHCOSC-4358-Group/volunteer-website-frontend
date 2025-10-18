import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PALETTE = {
  navy: "#22577A",
  teal: "#38A3A5",
  green: "#26A96C",
  mint: "#80ED99",
  sand: "#F0EADF",
};

function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    skills: [] as string[],
    preferences: "",
    availability: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSkills = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      skills: selectedSkills
    }));
  };

  const addNewSkill = () => {
    const skillInput = document.getElementById('newSkill') as HTMLInputElement;
    const skillsSelect = document.getElementById('skills') as HTMLSelectElement;
    
    if (skillInput.value.trim()) {
      const newSkill = skillInput.value.trim();
      const skillValue = newSkill.toLowerCase().replace(/\s+/g, '-');
      
      // Add to form data
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillValue]
      }));

      // Add to select options
      const option = document.createElement('option');
      option.value = skillValue;
      option.textContent = newSkill;
      option.selected = true;
      skillsSelect.appendChild(option);
      
      skillInput.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required.";
    else if (formData.fullName.length > 50)
      newErrors.fullName = "Full name cannot exceed 50 characters.";

    if (!formData.address1.trim()) newErrors.address1 = "Address 1 is required.";
    else if (formData.address1.length > 100)
      newErrors.address1 = "Address 1 cannot exceed 100 characters.";

    if (formData.address2.length > 100)
      newErrors.address2 = "Address 2 cannot exceed 100 characters.";

    if (!formData.city.trim()) newErrors.city = "City is required.";
    else if (formData.city.length > 100)
      newErrors.city = "City cannot exceed 100 characters.";

    if (!formData.state) newErrors.state = "State is required.";

    if (!formData.zip.trim()) newErrors.zip = "Zip code is required.";
    else if (!/^\d{5,9}$/.test(formData.zip))
      newErrors.zip = "Zip code must be between 5 and 9 digits.";

    if (formData.skills.length === 0)
      newErrors.skills = "Please select at least one skill.";

    if (formData.availability.length === 0)
      newErrors.availability = "Please select at least one available date.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!validateForm()) {
      alert('Please fix the highlighted errors before submitting.');
      return;
    }

    setLoading(true);

    try {
      // Save profile data
      await saveProfileData(formData);
      console.log("Profile completion successful:", formData);
      
      // Redirect to volunteer profile page
      navigate('/volunteer-profile', { state: { profileData: formData } });
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to save profile data
  const saveProfileData = async (data: typeof formData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Profile saved:', data);
    
    // Save to localStorage (replace with your backend API)
    localStorage.setItem('volunteerProfile', JSON.stringify(data));
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center p-6"
      style={{ backgroundColor: PALETTE.sand }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl p-8 rounded-2xl shadow-md"
        style={{ backgroundColor: "#fff", borderTop: `6px solid ${PALETTE.teal}` }}
      >
        <h2 className="text-2xl font-bold mb-1 text-center" style={{ color: PALETTE.navy }}>
          Create User Profile
        </h2>
        <p className="text-sm text-center mb-8" style={{ color: PALETTE.teal }}>
          * required field
        </p>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="col-span-1">
            <label htmlFor="fullName" className="block font-semibold mb-1" style={{ color: PALETTE.navy }}>
              Full Name *
            </label>
            <input
              id="fullName"
              type="text"
              maxLength={50}
              required
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full p-2 rounded border focus:outline-none focus:ring-2"
              style={{ borderColor: PALETTE.mint }}
            />
          </div>

          {/* Address 1 */}
          <div className="col-span-1">
            <label htmlFor="address1" className="block font-semibold mb-1" style={{ color: PALETTE.navy }}>
              Address 1 *
            </label>
            <input
              id="address1"
              type="text"
              maxLength={100}
              required
              value={formData.address1}
              onChange={handleInputChange}
              className="w-full p-2 rounded border focus:outline-none focus:ring-2"
              style={{ borderColor: PALETTE.mint }}
            />
          </div>

          {/* Address 2 */}
          <div className="col-span-1">
            <label htmlFor="address2" className="block font-semibold mb-1" style={{ color: PALETTE.navy }}>
              Address 2
            </label>
            <input
              id="address2"
              type="text"
              maxLength={100}
              value={formData.address2}
              onChange={handleInputChange}
              className="w-full p-2 rounded border focus:outline-none focus:ring-2"
              style={{ borderColor: PALETTE.mint }}
            />
          </div>

          {/* City */}
          <div className="col-span-1">
            <label htmlFor="city" className="block font-semibold mb-1" style={{ color: PALETTE.navy }}>
              City *
            </label>
            <input
              id="city"
              type="text"
              maxLength={100}
              required
              value={formData.city}
              onChange={handleInputChange}
              className="w-full p-2 rounded border focus:outline-none focus:ring-2"
              style={{ borderColor: PALETTE.mint }}
            />
          </div>

          {/* State */}
          <div className="col-span-1">
            <label htmlFor="state" className="block font-semibold mb-1" style={{ color: PALETTE.navy }}>
              State *
            </label>
            <select
              id="state"
              required
              value={formData.state}
              onChange={handleInputChange}
              className="w-full p-2 rounded border focus:outline-none focus:ring-2"
              style={{ borderColor: PALETTE.mint }}
            >
              <option value="">Select a state</option>
              <option value="AK">Alaska</option>
              <option value="AL">Alabama</option>
              <option value="AR">Arkansas</option>
              <option value="AZ">Arizona</option>
              <option value="CA">California</option>
              <option value="CO">Colorado</option>
              <option value="CT">Connecticut</option>
              <option value="DC">District of Columbia</option>
              <option value="DE">Delaware</option>
              <option value="FL">Florida</option>
              <option value="GA">Georgia</option>
              <option value="HI">Hawaii</option>
              <option value="IA">Iowa</option>
              <option value="ID">Idaho</option>
              <option value="IL">Illinois</option>
              <option value="IN">Indiana</option>
              <option value="KS">Kansas</option>
              <option value="KY">Kentucky</option>
              <option value="LA">Louisiana</option>
              <option value="MA">Massachusetts</option>
              <option value="MD">Maryland</option>
              <option value="ME">Maine</option>
              <option value="MI">Michigan</option>
              <option value="MN">Minnesota</option>
              <option value="MO">Missouri</option>
              <option value="MS">Mississippi</option>
              <option value="MT">Montana</option>
              <option value="NC">North Carolina</option>
              <option value="ND">North Dakota</option>
              <option value="NE">Nebraska</option>
              <option value="NH">New Hampshire</option>
              <option value="NJ">New Jersey</option>
              <option value="NM">New Mexico</option>
              <option value="NV">Nevada</option>
              <option value="NY">New York</option>
              <option value="OH">Ohio</option>
              <option value="OK">Oklahoma</option>
              <option value="OR">Oregon</option>
              <option value="PA">Pennsylvania</option>
              <option value="RI">Rhode Island</option>
              <option value="SC">South Carolina</option>
              <option value="SD">South Dakota</option>
              <option value="TN">Tennessee</option>
              <option value="TX">Texas</option>
              <option value="UT">Utah</option>
              <option value="VA">Virginia</option>
              <option value="VT">Vermont</option>
              <option value="WA">Washington</option>
              <option value="WI">Wisconsin</option>
              <option value="WV">West Virginia</option>
              <option value="WY">Wyoming</option>
            </select>
          </div>

          {/* Zip Code */}
          <div className="col-span-1">
            <label htmlFor="zip" className="block font-semibold mb-1" style={{ color: PALETTE.navy }}>
              Zip Code *
            </label>
            <input
              id="zip"
              type="text"
              maxLength={9}
              required
              value={formData.zip}
              onChange={handleInputChange}
              className="w-full p-2 rounded border focus:outline-none focus:ring-2"
              style={{ borderColor: PALETTE.mint }}
            />
          </div>

          {/* Skills (full width) */}
          <div className="md:col-span-2">
            <label htmlFor="skills" className="block font-semibold mb-1" style={{ color: PALETTE.navy }}>
              Skills *
            </label>
            <select
              id="skills"
              multiple
              required
              value={formData.skills}
              onChange={handleSkillsChange}
              className="w-full p-2 rounded border h-28 focus:outline-none focus:ring-2"
              style={{ borderColor: PALETTE.mint }}
            >
              <option value="teaching">Teaching</option>
              <option value="cooking">Cooking</option>
              <option value="first-aid">First Aid</option>
              <option value="construction">Construction</option>
            </select>
            <p className="text-xs mt-1" style={{ color: PALETTE.teal }}>
              Hold Ctrl (Windows) or ⌘ (Mac) to select multiple.
            </p>
          </div>

          {/* Add Skills (full width) */}
          <div className="md:col-span-2">
            <label htmlFor="newSkill" className="block font-semibold mb-1" style={{ color: PALETTE.navy }}>
              Add New Skill
            </label>
            <input
              id="newSkill"
              type="text"
              maxLength={50}
              className="w-full p-2 rounded border focus:outline-none focus:ring-2"
              style={{ borderColor: PALETTE.mint }}
              placeholder="Enter a new skill"
            />
            <button
              type="button"
              className="mt-2 font-semibold py-2 px-4 rounded-full shadow-md transition-transform hover:scale-105"
              style={{ backgroundColor: PALETTE.teal, color: "white" }}
              onClick={addNewSkill}
            >
              Add Skill
            </button>
          </div>

          {/* Preferences (full width) */}
          <div className="md:col-span-2">
            <label htmlFor="preferences" className="block font-semibold mb-1" style={{ color: PALETTE.navy }}>
              Preferences
            </label>
            <textarea
              id="preferences"
              rows={3}
              value={formData.preferences}
              onChange={handleInputChange}
              className="w-full p-2 rounded border focus:outline-none focus:ring-2"
              style={{ borderColor: PALETTE.mint }}
            ></textarea>
          </div>

          {/* Availability */}
          <div className="col-span-1">
            <label htmlFor="availability" className="block font-semibold mb-1" style={{ color: PALETTE.navy }}>
              Availability *
            </label>
            <input
              id="availability"
              type="date"
              required
              value={formData.availability}
              onChange={handleInputChange}
              className="w-full p-2 rounded border focus:outline-none focus:ring-2"
              style={{ borderColor: PALETTE.mint }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={loading}
            className="font-semibold py-2 px-8 rounded-full shadow-md transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: PALETTE.teal, color: "white" }}
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;