// MedSecAccInfo.jsx

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Row, Button } from 'react-bootstrap';
import MedSecNavbar from '../../navbar/MedSecNavbar';
import MedicalSecretaryInfoForm from './MedicalSecretaryInfoForm'; // Import the form component
import AuditMedSec from './AuditMedSec';
import TwoFactorAuth from '../../../../patient/patientinformation/TwoFactorAuth/TwoFactorAuth';
import ChatComponent from '../../../../chat/ChatComponent';
import { ChatDotsFill } from 'react-bootstrap-icons';


const MedSecAccInfo = () => {
  const location = useLocation(); 
  const { userId, userName, role } = location.state || {};

  const [activeTab, setActiveTab] = useState('info');
  const [showChat, setShowChat] = useState(false);
  return (
    <div>
      <MedSecNavbar msid={userId} />
      <Container fluid style={{ overflowY: 'auto', height: 'calc(100vh - 100px)', width: '100%', paddingBottom: '1.5rem' }}>
        <div className='maincolor-container'>
          <div className='content-area'>
            <Container className="d-flex justify-content-start ">
              <Row>
                <div className="horizontal-tabs">
                  <a
                    onClick={() => setActiveTab("info")}
                    className={activeTab === "info" ? "active" : ""}
                  >
                    My details
                  </a>


                  <a
                    onClick={() => setActiveTab("audit")}
                    className={activeTab === "audit" ? "active" : ""}
                  >
                    Activity Log
                  </a>
                </div>    
              </Row>
            </Container>

            <div className="chat-btn-container">
                  <Button
                    className="chat-toggle-btn"
                    onClick={() => setShowChat(!showChat)}
                  >
                    <ChatDotsFill size={30} />
                  </Button>
                </div>

                {showChat && (
                  <div className="chat-overlay">
                    {showChat && (
                      <div className="chat-overlay">
                        <ChatComponent
                          userId={userId}
                          userRole={role}
                          closeChat={() => setShowChat(false)}
                        />
                      </div>
                    )}
                  </div>
                )}

            <Container className='border-top'>
              {activeTab === 'info' && <MedicalSecretaryInfoForm msid={userId} />} {/* Render the form */}
              {activeTab === 'audit' && <AuditMedSec msid={userId} />} {/* Render the audit */}
              {activeTab === 'authentication' && <TwoFactorAuth />} 
            </Container>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default MedSecAccInfo;
