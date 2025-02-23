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
       
        </Container>

        </>

  );
}

export default AllDoctors;
