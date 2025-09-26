function Profile() {
  return (
    <div className="profile-page">
      <form className="profile-form">
        {/* Full Name */}
        <div className="user-pfp-text">Create User Profile</div>
        <div className="required-field">* required field</div>
        <div className="form-group">
          <label htmlFor="fullName">Full Name *</label>
          <input id="fullName" type="text" maxLength={50} required />
        </div>

        {/* Address 1 */}
        <div className="form-group">
          <label htmlFor="address1">Address 1 *</label>
          <input id="address1" type="text" maxLength={100} required />
        </div>

        {/* Address 2 */}
        <div className="form-group">
          <label htmlFor="address2">Address 2</label>
          <input id="address2" type="text" maxLength={100} />
        </div>

        {/* City */}
        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input id="city" type="text" maxLength={100} required />
        </div>

        {/* State */}
        <div className="form-group">
          <label htmlFor="state">State *</label>
          <select id="state" required>
            <option value="">Select a state</option>
            <option value="TX">Texas</option>
            <option value="FL">Florida</option>
            <option value="CA">California</option>
            {/* Add more states here */}
          </select>
        </div>

        {/* Zip Code */}
        <div className="form-group">
          <label htmlFor="zip">Zip Code *</label>
          <input id="zip" type="text" maxLength={9} required />
        </div>

        {/* Skills */}
        <div className="form-group">
          <label htmlFor="skills">Skills *</label>
          <select id="skills" multiple required>
            <option value="teaching">Teaching</option>
            <option value="cooking">Cooking</option>
            <option value="first-aid">First Aid</option>
            <option value="construction">Construction</option>
          </select>
        </div>

        {/* Preferences */}
        <div className="form-group">
          <label htmlFor="preferences">Preferences</label>
          <textarea id="preferences" rows={3}></textarea>
        </div>

        {/* Availability */}
        <div className="form-group">
          <label htmlFor="availability">Availability *</label>
          <input id="availability" type="date" required />
        </div>

        {/* Actions */}
        <div className="submit-button">
          <button type="submit">Save Profile</button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
