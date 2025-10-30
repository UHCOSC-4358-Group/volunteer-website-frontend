import { useNavigate } from "react-router-dom";
import { VolunteerSVG } from "../assets/Svg";

const PALETTE = {
  navy: "#22577A",
  teal: "#38A3A5",
  green: "#26A96C",
  mint: "#80ED99",
  sand: "#F0EADF",
};

export function ContactPage() {
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
            <div className="text-2xl font-thin">Contact Us</div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">📧</div>
            <h1 className="text-4xl font-bold mb-4" style={{ color: PALETTE.navy }}>
              Get In Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We'd love to hear from you! Whether you have questions, feedback, or want to partner with us, 
              we're here to help.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Email */}
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: PALETTE.teal }}>
                Email Us
              </h3>
              <p className="text-gray-700 mb-2">volunteerhub@cosc4353.edu</p>
              <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
              <button
                onClick={() => window.location.href = 'mailto:volunteerhub@cosc4358.edu'}
                className="mt-4 font-semibold py-2 px-6 rounded-full transition-transform hover:scale-105"
                style={{ 
                  backgroundColor: PALETTE.teal, 
                  color: "white"
                }}
              >
                Send Email
              </button>
            </div>

            {/* Phone */}
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: PALETTE.teal }}>
                Call Us
              </h3>
              <p className="text-gray-700 mb-2">(555) 123-VOLUNTEER</p>
              <p className="text-sm text-gray-500">Mon-Fri, 9AM-5PM CST</p>
              <button
                onClick={() => window.location.href = 'tel:5551234686833'}
                className="mt-4 font-semibold py-2 px-6 rounded-full transition-transform hover:scale-105"
                style={{ 
                  backgroundColor: PALETTE.teal, 
                  color: "white"
                }}
              >
                Call Now
              </button>
            </div>

            {/* Office */}
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">🏫</div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: PALETTE.teal }}>
                Visit Our Office
              </h3>
              <p className="text-gray-700 mb-1">Computer Science Department</p>
              <p className="text-gray-700 mb-1">University Building</p>
              <p className="text-gray-700 mb-2">Room 4358</p>
              <p className="text-sm text-gray-500">Stop by during office hours</p>
            </div>

            {/* Support */}
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: PALETTE.teal }}>
                Student Support
              </h3>
              <p className="text-gray-700 mb-2">Discord: volunteerhub-support</p>
              <p className="text-sm text-gray-500">Real-time chat with our team</p>
              <button
                className="mt-4 font-semibold py-2 px-6 rounded-full border transition-transform hover:scale-105"
                style={{ 
                  borderColor: PALETTE.teal, 
                  color: PALETTE.teal,
                  backgroundColor: 'white'
                }}
              >
                Join Discord
              </button>
            </div>
          </div>

          {/* Office Hours */}
          <div className="bg-white border rounded-xl p-8 mb-12" style={{ borderColor: PALETTE.mint }}>
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: PALETTE.navy }}>
              Office Hours
            </h2>
            <div className="max-w-md mx-auto">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: PALETTE.mint }}>
                  <span className="font-semibold" style={{ color: PALETTE.navy }}>Monday - Thursday</span>
                  <span className="text-gray-700">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: PALETTE.mint }}>
                  <span className="font-semibold" style={{ color: PALETTE.navy }}>Friday</span>
                  <span className="text-gray-700">9:00 AM - 3:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold" style={{ color: PALETTE.navy }}>Weekends</span>
                  <span className="text-gray-700">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-12">
            <div className="text-center">
              <div className="text-3xl mb-4">🚨</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#dc2626' }}>
                Emergency Contact
              </h3>
              <p className="text-gray-700 mb-4">
                For urgent matters outside office hours, please call our emergency line:
              </p>
              <p className="text-2xl font-bold mb-4" style={{ color: '#dc2626' }}>
                (555) 911-VOLUNTEER
              </p>
              <p className="text-sm text-gray-600">
                Available 24/7 for critical issues requiring immediate attention
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-gray-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: PALETTE.navy }}>
              Frequently Asked Questions
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold mb-2" style={{ color: PALETTE.teal }}>
                  How do I sign up for an event?
                </h4>
                <p className="text-gray-600 text-sm">
                  Browse available events on our platform, click on any event to view details, 
                  and click "Sign Up" if there are available spots.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold mb-2" style={{ color: PALETTE.teal }}>
                  Can organizations post events?
                </h4>
                <p className="text-gray-600 text-sm">
                  Yes! Organizations can register and post volunteer opportunities. 
                  Contact us to learn more about partnership opportunities.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold mb-2" style={{ color: PALETTE.teal }}>
                  Is there a mobile app?
                </h4>
                <p className="text-gray-600 text-sm">
                  Currently, we're web-only, but our site is mobile-friendly. 
                  A mobile app is in our future development plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="p-8 font-bold text-white text-center mt-12"
        style={{ backgroundColor: PALETTE.teal }}
      >
        <div>We're here to help you make a difference! 🌟</div>
      </footer>
    </div>
  );
}