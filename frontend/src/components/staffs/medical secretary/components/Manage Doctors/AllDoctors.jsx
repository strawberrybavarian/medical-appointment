import React, { useState } from 'react';
import MedSecNavbar from '../../navbar/MedSecNavbar';
import { Container, Row } from 'react-bootstrap';
import DoctorCards from './DoctorCards';
import DeactivationRequests from '../../../admin/appointment/doctors/DeactivationRequests';
import Nav from 'react-bootstrap/Nav';
import { useLocation } from 'react-router-dom';
function AllDoctors() {
  const location = useLocation();  // Retrieve state from location
  const { userId, userName, role } = location.state || {};
  const [activeTab, setActiveTab] = useState('doctorCards'); // Default to 'doctorCards'
  console.log('this is the AllDoctors', userId);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>


      <div style={{ flex: 1 }}>
        <MedSecNavbar msid={userId}/>
        <Container fluid style={{ overflowY: 'auto', height: 'calc(100vh - 100px)', width: '100%', paddingBottom: '1.5rem' }}>
          {/* Navigations */}
          
         

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
       
        </Container>
      </div>
    </div>
  );
}

export default AllDoctors;
