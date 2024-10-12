import React from 'react'
import axios from 'axios';
import { Container, Row , Col } from 'react-bootstrap';
import AdminNavbar from '../navbar/AdminNavbar';
import SidebarAdmin from '../sidebar/SidebarAdmin';
import { useParams } from 'react-router-dom';
import DeactivationRequests from './doctors/DeactivationRequests';
function AdminAppointmentMain() {
    const { aid } = useParams();
    console.log(aid);
    
  return (
    <div className="d-flex justify-content-center">
    <SidebarAdmin aid={aid} />
    <div style={{ width: '100%' }}>
        <AdminNavbar />
        <Container fluid className='ad-container p-5' style={{ height: 'calc(100vh - 56px)', overflowY: 'auto',  padding: '20px'}}>
       
        <Row className="mt-4">
            <Col md={6} className="mb-3">
                <DeactivationRequests/>
            
            </Col>

            <Col md={6} className="mb-3">
 
            </Col>
        </Row>
            
            
            
    
        </Container>
    </div>
</div>
  )
}

export default AdminAppointmentMain
