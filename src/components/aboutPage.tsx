import { useNavigate } from "react-router-dom";
import { VolunteerSVG } from "../assets/Svg";

const PALETTE = {
  navy: "#22577A",
  teal: "#38A3A5",
  green: "#26A96C",
  mint: "#80ED99",
  sand: "#F0EADF",
};

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ backgroundColor: PALETTE.sand }}>
      {/* Header */}
      <header className="text-white" style={{ backgroundColor: PALETTE.teal }}>
        <nav className="flex justify-between items-center p-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="text-white hover:opacity-80 transition-opacity"
            >
              ← Back
            </button>
            <div>
              <VolunteerSVG size={48} />
            </div>
            <div className="text-2xl font-thin">About Us</div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">🌟</div>
            <h1 className="text-4xl font-bold mb-4" style={{ color: PALETTE.navy }}>
              About VolunteerHub
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connecting passionate volunteers with meaningful opportunities to make a difference in our community.
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: PALETTE.navy }}>
              Our Mission
            </h2>
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <p className="text-lg text-gray-700 leading-relaxed">
                To make volunteering accessible to everyone by bridging the gap between 
                organizations in need and individuals who want to make a positive impact. 
                We believe that every act of service, no matter how small, contributes to 
                building stronger, more connected communities.
              </p>
            </div>
          </div>

          {/* What We Do Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: PALETTE.navy }}>
              What We Do
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border rounded-xl p-6 shadow-sm" style={{ borderColor: PALETTE.mint }}>
                <div className="text-3xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: PALETTE.teal }}>
                  Connect Volunteers
                </h3>
                <p className="text-gray-600">
                  We match passionate individuals with local organizations that need their skills and time.
                </p>
              </div>

              <div className="bg-white border rounded-xl p-6 shadow-sm" style={{ borderColor: PALETTE.mint }}>
                <div className="text-3xl mb-4">📱</div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: PALETTE.teal }}>
                  Streamline Registration
                </h3>
                <p className="text-gray-600">
                  Our platform makes it easy to find, sign up, and track your volunteer activities.
                </p>
              </div>

              <div className="bg-white border rounded-xl p-6 shadow-sm" style={{ borderColor: PALETTE.mint }}>
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: PALETTE.teal }}>
                  Track Impact
                </h3>
                <p className="text-gray-600">
                  Monitor your volunteer hours and see the difference you're making in your community.
                </p>
              </div>

              <div className="bg-white border rounded-xl p-6 shadow-sm" style={{ borderColor: PALETTE.mint }}>
                <div className="text-3xl mb-4">🌱</div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: PALETTE.teal }}>
                  Build Community
                </h3>
                <p className="text-gray-600">
                  Foster lasting relationships and create networks of support through shared service.
                </p>
              </div>
            </div>
          </div>

          {/* Our Story Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: PALETTE.navy }}>
              Our Story
            </h2>
            <div className="bg-white border rounded-xl p-8" style={{ borderColor: PALETTE.mint }}>
              <p className="text-gray-700 mb-4">
                VolunteerHub was born in a COSC 4353 classroom, where a group of computer science students 
                recognized the need for a better way to connect volunteers with opportunities. We saw that 
                many people wanted to help but didn't know where to start, while organizations struggled to 
                find reliable volunteers.
              </p>
              <p className="text-gray-700">
                What began as a class project has evolved into a passion-driven platform dedicated to 
                making community service more accessible, organized, and rewarding for everyone involved.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: PALETTE.navy }}>
              Our Values
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-4">❤️</div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: PALETTE.teal }}>
                  Community First
                </h3>
                <p className="text-gray-600">
                  Every decision we make is guided by what's best for our community.
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: PALETTE.teal }}>
                  Accessibility & Inclusion
                </h3>
                <p className="text-gray-600">
                  We believe everyone should have the opportunity to volunteer.
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: PALETTE.teal }}>
                  Transparency & Trust
                </h3>
                <p className="text-gray-600">
                  We operate with honesty and build relationships based on trust.
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: PALETTE.teal }}>
                  Continuous Improvement
                </h3>
                <p className="text-gray-600">
                  We're always learning and evolving to serve you better.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gray-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: PALETTE.navy }}>
              Ready to Make a Difference?
            </h2>
            <p className="text-gray-600 mb-6">
              Join thousands of volunteers who are transforming their communities through service.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/user-event-site')}
                className="font-semibold py-3 px-8 rounded-full transition-transform hover:scale-105"
                style={{ 
                  backgroundColor: PALETTE.teal, 
                  color: "white"
                }}
              >
                Browse Events
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="font-semibold py-3 px-8 rounded-full border transition-transform hover:scale-105"
                style={{ 
                  borderColor: PALETTE.teal, 
                  color: PALETTE.teal,
                  backgroundColor: 'white'
                }}
              >
                Get In Touch
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="p-8 font-bold text-white text-center mt-12"
        style={{ backgroundColor: PALETTE.teal }}
      >
        <div>Made with by COSC 4353 team</div>
      </footer>
    </div>
  );
}