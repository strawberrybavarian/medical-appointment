import React from 'react'
import ManageSpecialty from './ManageSpecialty'
import SidebarAdmin from '../sidebar/SidebarAdmin'
import { Container, Row, Col } from 'react-bootstrap';
import AdminNavbar from '../navbar/AdminNavbar';
import { useParams } from 'react-router-dom';
import ManageServices from './ManageServices';
function SasMain() {
    const { aid } = useParams();
  return (
    <div className="d-flex justify-content-center">
    <SidebarAdmin aid={aid} />
    <div style={{ width: '100%' }}>
        <AdminNavbar />
        <Container fluid className='ad-container p-5' style={{ height: 'calc(100vh - 56px)', overflowY: 'auto',  padding: '20px'}}>
           


        <Row className="mt-4">
            <Col md={6} className="mb-3">
                <ManageSpecialty aid={aid}/>
            </Col>

            <Col md={6} className="mb-3">
                <ManageServices/>

            </Col>
        </Row>
            
            
            
    
        </Container>
    </div>
</div>
  )
}

export default SasMain
