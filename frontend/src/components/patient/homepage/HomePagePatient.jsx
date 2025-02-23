import { Container, Button } from 'react-bootstrap';
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import './HomePagePatient.css';
import DoctorSpecialty from './DoctorSpecialty';
import DoctorCarousel from './DoctorCarousel';

import Footer from '../../Footer';
import DoctorServices from './DoctorServices';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ReactTooltip from 'react-tooltip'; // Tooltip library
import { ChatDotsFill } from 'react-bootstrap-icons';
import ChatComponent from '../../chat/ChatComponent';
import { useUser } from '../../UserContext';
function HomePagePatient() {
  const navigate = useNavigate();
  const { user } = useUser();


  const [showChat, setShowChat] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');

  useEffect(() => {
    if(!user._id){
      navigate('/medapp/login');
    }
  }, [user._id, navigate]);


  // Tooltip messages array
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


  useEffect(() => {
    const randomMessage = tooltips[Math.floor(Math.random() * tooltips.length)];
    setTooltipMessage(randomMessage);
  }, []);




  // Extract patient information
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <>
      <Container
        className="cont-fluid-no-gutter"
        fluid
        style={{ overflowY: 'auto', height: '100vh' }}
      >
        <PatientNavBar pid={user._id} />
        <div className="maincolor-container">
          {/* Main Content Area */}
          <div className="content-area p-0 m-0">
            
            <div fluid className="background-hpp">
              <DoctorCarousel fluid className="w-100" pid={user._id} />
            </div>
            <DoctorSpecialty fluid className="w-100" pid={user._id} />
            <DoctorServices fluid className="w-100" pid={user._id} />
            {/* Chat Button */}
            <div className="chat-btn-container">
              <Button
                className="chat-toggle-btn"
                onClick={() => setShowChat(!showChat)}
                data-tip={tooltipMessage} // Attach the tooltip message
                data-for="chatTooltip"
              >
                <ChatDotsFill size={30} />
              </Button>
            </div>
            <ReactTooltip id="chatTooltip" place="top" effect="solid" />
            {showChat && (
              <div className="chat-overlay">
                <ChatComponent
                  userId={user._id}
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
