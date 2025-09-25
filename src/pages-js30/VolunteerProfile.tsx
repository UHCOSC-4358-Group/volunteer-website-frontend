import {
  SettingsCogSVG,
  NotificationBellSVG,
  ProfileSVG,
  SearchSVG,
  VolunteerSVG,
  ClockSVG,
  Card,
  EventCard
} from '../components';
import { DUMMY_DATA } from '../data';

function VolunteerProfile() {
  return (
    <>
      <header className="text-white bg-(--color-jade) p-1">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-4 pl-3">
            <div>
              <VolunteerSVG size={64} />
            </div>
            <div className="text-4xl font-thin">Volunter</div>
          </div>

          <div className="flex gap-4 items-center">
            <a href="/">Features</a>
            <a href="/">About</a>
            <a href="/">Contact</a>
            <ProfileSVG size={48} />
          </div>
        </nav>
      </header>
      <main>
        <section>
          <div className="p-8 text-2xl">
            <div className="flex justify-between">
              <div>
                <div>Welcome back, Alex!</div>
                <div className="text-lg text-gray-500">
                  Ready to make a difference today?
                </div>
              </div>
              <div className="flex gap-4">
                <button className="border p-3 rounded-xl hover:bg-gray-200 transition-colors">
                  <NotificationBellSVG size={30} />
                </button>
                <button className="border p-3 rounded-xl hover:bg-gray-200 transition-colors">
                  <SettingsCogSVG size={30} />
                </button>
              </div>
            </div>
          </div>
        </section>
        <div className="border-t-1 border-gray-500 ml-5 mr-5"></div>
        <section>
          <div className="flex justify-around gap-8 p-4 flex-col items-center md:flex-row">
            <Card
              icon={<VolunteerSVG size={64} />}
              title="21"
              subtitle="Events completed"
            />
            <Card
              icon={<ClockSVG size={64} />}
              title="63"
              subtitle="Hours volunteered"
            />
            <Card
              icon={<SearchSVG size={64} />}
              title="4"
              subtitle="Upcoming events"
            />
          </div>
        </section>
        <section>
          <div className="">
            <div className="grid grid-cols-3 gap-2 justify-items-between items-center max-w-6xl mx-auto">
              <div className="col-span-1">
                <div className="text-2xl">Your Upcoming Events</div>
                <div className="text-xl text-gray-600">
                  Events you've signed up for
                </div>
              </div>
              <div role="search" className="relative col-span-2">
                <button className="absolute top-1/2 left-1 transform -translate-y-1/2 z-10 rounded-full hover:bg-gray-300 p-1.5 transition-colors">
                  <SearchSVG size={24} />
                </button>
                <input
                  type="text"
                  className="border border-gray-500 pl-10 pr-4 py-2 rounded-full w-full focus:outline-none focus:ring-blue-500 transition-all"
                  placeholder="Search Events"
                />
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 pt-5 pb-5 gap-4 md:gap-8 justify-items-center w-[clamp(1rem, 5vw, 8rem)]">
            {DUMMY_DATA.map((cardData, index) => (
              <EventCard key={index} {...cardData} />
            ))}
          </div>
        </section>
      </main>
      <footer className="bg-(--color-blue) p-10 font-bold text-white flex justify-center items-center">
        <div>Made by COSC 4358 team!</div>
      </footer>
    </>
  );
}

export default VolunteerProfile;
