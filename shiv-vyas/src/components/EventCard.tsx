interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  location: string;
  type: string;
  description: string;
  organization: string;
  volunteersSignedUp: number;
  maxVolunteers: number;
  requirements: string[];
}

interface Props {
  event: Event;
}

function EventCard({ event }: Props) {
  return (
    <div className="event-card">
        <div className="event-header">
            <h2 className="event-title">{event.name}</h2>
            <p className="event-organization">{event.organization}</p>
        </div>

        <div className="event-details">
            <p className="event-date">
              <strong>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi-calendar-event" viewBox="0 0 16 16">
                  <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z"/>
                  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
                </svg>
              </strong> 
              {event.date}
            </p>
            <p className="event-time">
              <strong>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi-clock" viewBox="0 0 16 16">
                  <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/>
                </svg>
              </strong> 
              {event.time}
            </p>
            <p className="event-location">
              <strong>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi-geo-alt" viewBox="0 0 16 16">
                  <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/>
                  <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                </svg>
              </strong> 
              {event.location}
            </p>
            <p className="event-type">{event.type}</p>
        </div>
        
        <p className="event-description">{event.description}</p>
        <ul className="event-requirements">
          <p>Requirements</p>
          {event.requirements.map((req, index) => (
            <li key={index}>{req}</li>
          ))}
        </ul>
        <div className="event-footer">
            <p className="event-volunteers">
              <strong>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi-person" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                </svg>
              </strong> 
              {event.volunteersSignedUp}/{event.maxVolunteers}
            </p>
        </div>
        <div className="event-buttons">
          <button onClick={() => {}}>Sign Up</button>
          <button onClick={() => {}}>View Details</button>
        </div>
    </div>

  );
}

export default EventCard;
