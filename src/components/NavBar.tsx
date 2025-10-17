
function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Volunteer Events</div>
      <div className="navbar-links">
        <a href="/" className="nav-link">Home</a>
        <a href="/event-card" className="nav-link">Events</a>
        <a href="/profile" className="nav-link">Profile</a>
      </div>
    </nav>
  );
}

export default NavBar;