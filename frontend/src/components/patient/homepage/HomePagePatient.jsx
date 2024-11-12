import { Container, Button } from 'react-bootstrap';
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import './HomePagePatient.css';
import DoctorSpecialty from './DoctorSpecialty';
import DoctorCarousel from './DoctorCarousel';
import { usePatient } from '../PatientContext';
import Footer from '../../Footer';
import DoctorServices from './DoctorServices';
import { useNavigate } from 'react-router-dom';
import { ip } from '../../../ContentExport';
import ChatComponent from '../../chat/ChatComponent';
import { useState, useEffect } from 'react';
import ReactTooltip from 'react-tooltip'; // Tooltip library
import { ChatDotsFill } from 'react-bootstrap-icons';
function HomePagePatient() {
  const navigate = useNavigate();
  const { patient } = usePatient(); // Get patient data from context

  if (!patient) {
    navigate("/medapp/login"); // Redirect to login page if patient data is not found
  }

  const fullName = `${patient.patient_firstName} ${patient.patient_lastName}`;
  const [showChat, setShowChat] = useState(false);

  // Array of tooltip messages
  const tooltips = [
    "Chat with us!",
    "Need help? Click here to chat!",
    "We're here to assist you!",
    "Talk to us if you need any help!",
    "Reach out to our team via chat!",
    "Have questions? Let's chat!",
    "We’re online, click to chat!",
    "Need a hand? Start a chat!",
    "Get in touch with us through chat!",
    "We’re available to assist you now!",
  ];

  // State to hold the current tooltip message
  const [tooltipMessage, setTooltipMessage] = useState('');

  // Effect to randomize the tooltip message on component mount
  useEffect(() => {
    const randomMessage = tooltips[Math.floor(Math.random() * tooltips.length)];
    setTooltipMessage(randomMessage);
  }, []);

  return (
    <>
      
      <Container
        className="cont-fluid-no-gutter"
        fluid
        style={{ overflowY: 'scroll', height: '100vh'}}
      >
        <PatientNavBar pid={patient._id} />
        <div className="maincolor-container">
          {/* Main Content Area */}
          <div className="content-area p-0 m-0">
            <div fluid className="background-hpp">

              <DoctorCarousel fluid className="w-100" pid={patient._id} />
            </div>

            <DoctorSpecialty fluid className="w-100" pid={patient._id} />
            <DoctorServices fluid className="w-100" pid={patient._id} />
          
          
          {/* Chat Button */}
          <div className="chat-btn-container">
            <Button
              className="chat-toggle-btn"
              onClick={() => setShowChat(!showChat)}
              data-tip={tooltipMessage} // Attach the tooltip message
              data-for="chatTooltip"
            >
              <ChatDotsFill size={30}/>
            </Button>
          </div>
            <ReactTooltip id="chatTooltip" place="top" effect="solid" />

            {showChat && (
              <div className="chat-overlay">
                <ChatComponent
                  userId={patient._id}
                  userRole="Patient"
                  closeChat={() => setShowChat(false)}
                />
              </div>
            )}
          </div>

          {/* Footer at the bottom */}
          <Container fluid className="footer-container cont-fluid-no-gutter">
            <Footer />
          </Container>
        </div>
      </Container>
    </>
  );
}

export default HomePagePatient;
