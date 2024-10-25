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
import { useState } from 'react';
import { BsChatDotsFill } from 'react-icons/bs'; // Chat icon

function HomePagePatient() {
  const navigate = useNavigate();
  const { patient } = usePatient(); // Get patient data from context

  if (!patient) {
    navigate("/medapp/login"); // Redirect to login page if patient data is not found
  }

  const fullName = `${patient.patient_firstName} ${patient.patient_lastName}`;
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <PatientNavBar pid={patient._id} />
      <Container
        className="cont-fluid-no-gutter"
        fluid
        style={{ overflowY: 'scroll', height: '100vh', paddingBottom: '100px' }}
      >
        <div className="maincolor-container">
          {/* Main Content Area */}
          <div className="content-area p-0 m-0">
            <div fluid className="background-hpp">
              <DoctorCarousel fluid className="w-100" pid={patient._id} />
            </div>

            <DoctorSpecialty fluid className="w-100" pid={patient._id} />
            <DoctorServices fluid className="w-100" pid={patient._id} />

            <button
              className="chat-toggle-btn"
              onClick={() => setShowChat(!showChat)}
            >
              <BsChatDotsFill />
            </button>

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
