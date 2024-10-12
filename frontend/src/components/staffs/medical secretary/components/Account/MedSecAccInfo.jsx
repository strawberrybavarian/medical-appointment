// MedSecAccInfo.jsx

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import MedSecNavbar from '../../navbar/MedSecNavbar';
import MedicalSecretaryInfoForm from './MedicalSecretaryInfoForm'; // Import the form component

const MedSecAccInfo = () => {
  const location = useLocation(); 
  const { userId, userName, role } = location.state || {};

  const [activeTab, setActiveTab] = useState('info');

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
                </div>    
              </Row>
            </Container>

            <Container className='border-top'>
              {activeTab === 'info' && <MedicalSecretaryInfoForm msid={userId} />} {/* Render the form */}
            </Container>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default MedSecAccInfo;
