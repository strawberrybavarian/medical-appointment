import React, { useState } from 'react';
import MedSecNavbar from '../../navbar/MedSecNavbar';
import { Container, Nav, Row } from 'react-bootstrap';
import DoctorCards from './DoctorCards';
import DeactivationRequests from '../../../admin/appointment/doctors/DeactivationRequests';

function AllDoctors() {
  const [activeTab, setActiveTab] = useState('doctorCards'); // Default to 'doctorCards'

  return (
    <div>
      <MedSecNavbar />
      <Container fluid style={{ overflowY: 'auto', height: 'calc(100vh - 100px)', width: '100%', paddingBottom: '1.5rem' }}>
        <div style={{ paddingLeft: '5rem', paddingRight: '5rem' }} className='pt-5'>
          {/* Tabs for switching between sections */}
          <Row>
            
            <Container className='d-flex justify-content-center'>
              <Nav fill variant="tabs" className='navtabs-pxmanagement' activeKey={activeTab} onSelect={(tab) => setActiveTab(tab)}>
                <Nav.Item>
                  <Nav.Link eventKey="doctorCards">Doctors</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="deactivationRequests">Appointment Deactivation Requests</Nav.Link>
                </Nav.Item>
              </Nav>

            </Container>
            
            
         
           
          </Row>

          {/* Conditional rendering based on the active tab */}
          <Row style={{ marginTop: '20px', marginBottom: '20px' }}>
            {activeTab === 'doctorCards' && (
              <DoctorCards />
            )}
            {activeTab === 'deactivationRequests' && (
              <DeactivationRequests />
            )}
          </Row>
        </div>
      </Container>
    </div>
  );
}

export default AllDoctors;
