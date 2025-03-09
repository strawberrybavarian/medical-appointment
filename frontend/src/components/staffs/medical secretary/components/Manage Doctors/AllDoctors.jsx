import React, { useState } from 'react';
import MedSecNavbar from '../../navbar/MedSecNavbar';
import { Container, Row, Button } from 'react-bootstrap';
import DoctorCards from './DoctorCards';
import DeactivationRequests from '../../../admin/appointment/doctors/DeactivationRequests';
import { useLocation } from 'react-router-dom';
import ChatComponent from '../../../../chat/ChatComponent';
import { ChatDotsFill } from 'react-bootstrap-icons';

function AllDoctors() {
  const location = useLocation();  // Retrieve state from location
  const { userId, userName, role } = location.state || {};
    const [showChat, setShowChat] = useState(false);
  
  const [activeTab, setActiveTab] = useState('doctorCards'); // Default to 'doctorCards'
  console.log('this is the AllDoctors', userId);
  
  return (
    <>
    
   
  
        
       <Container fluid className='px-0' style={{ overflowY: 'auto', height: 'calc(100vh)', width: '100%', paddingBottom: '1.5rem', overflowX: 'hidden' }} >
          {/* Navigations */}
          
         
          <MedSecNavbar msid={userId}/>
            <Container  className='border-top d-flex justify-content-center'>
              <Row style={{ marginTop: '20px', marginBottom: '20px' }}>
                {activeTab === 'doctorCards' && (
                  <DoctorCards msid={userId} />
                )}
                {activeTab === 'deactivationRequests' && (
                  <DeactivationRequests />
                )}
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
       
        </Container>

        </>

  );
}

export default AllDoctors;
