import './css/App.css';
import './css/NavBar.css'
import EventCard from './components/EventCard';
import NavBar from './components/NavBar'

function App() {
  const events = [
    {
      id: 1,
      name: "Beach Cleanup",
      date: "10/15/2025",
      time: "12:00",
      location: "Miami Beach, FL",
      type: "Environmental",
      description: "Join us to clean up trash along the beach.",
      organization: "Ocean Protectors",
      volunteersSignedUp: 27,
      maxVolunteers: 55,
      requirements: ["Teamwork", "Tool Use"]
    },
    {
      id: 2,
      name: "Food Bank Support",
      date: "11/02/2025",
      time: "9:00",
      location: "Houston, TX",
      type: "Community Service",
      description: "Help distribute food to families in need.",
      organization: "Houston Food Bank",
      volunteersSignedUp: 120,
      maxVolunteers: 120,
      requirements: ["Organization"]
    },
    {
      id: 3,
      name: "Park Tree Planting",
      date: "10/22/2025",
      time: "10:00",
      location: "Austin, TX",
      type: "Environmental",
      description: "Plant trees and beautify the local park.",
      organization: "Green Future",
      volunteersSignedUp: 45,
      maxVolunteers: 60,
      requirements: ["Organization", "Teamwork", "Tool Use"]
    },
    {
      id: 4,
      name: "Senior Center Visit",
      date: "10/30/2025",
      time: "14:00",
      location: "Dallas, TX",
      type: "Community Service",
      description: "Spend the afternoon playing games and talking with seniors.",
      organization: "Helping Hands",
      volunteersSignedUp: 18,
      maxVolunteers: 25,
      requirements: ["Social Skills"]
    },
    {
      id: 5,
      name: "Animal Shelter Support",
      date: "11/05/2025",
      time: "11:00",
      location: "San Antonio, TX",
      type: "Animal Care",
      description: "Feed, clean, and care for shelter animals. Do not go near Annie's cage!",
      organization: "Paws & Claws",
      volunteersSignedUp: 32,
      maxVolunteers: 40,
      requirements: ["Safety"]
    }
  ];


  return (
    <main className="main-content">
      <NavBar />
      <div className="filters">
        <label>
          <select>
            <option disabled selected>Filter by Type</option>
            <option>All</option>
            <option>Environmental</option>
            <option>Community Service</option>
            <option>Animal Care</option>
          </select>
        </label>

        <label>
          <select>
            <option disabled selected>Sort by Time</option>
            <option>None</option>
            <option>Earliest</option>
            <option>Latest</option>
          </select>
        </label>
      </div>
      <div className="events-grid">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </main>
  );
}

export default App;
