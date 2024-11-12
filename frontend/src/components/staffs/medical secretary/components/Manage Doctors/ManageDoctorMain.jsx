import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import DoctorScheduleManagement from './DoctorScheduleManagement';
import MSDoctorProfile from './MSDoctorProfile';
import MedSecNavbar from '../../navbar/MedSecNavbar';
import SpecificDoctorAppointments from './SpecificDoctorAppointments';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'; // Import Chevron Left icon

function ManageDoctorMain() {
    const location = useLocation();
    const { did, msid } = location.state || {}; // Get did and msid from location state
  
    
    const navigate = useNavigate(); // Initialize useNavigate for navigation

    console.log('Received did:', did);
    console.log('Received msid:', msid);
    
    const [activeTab, setActiveTab] = useState('profile');

    // Back navigation handler
    const handleBackClick = () => {
        navigate('/medsec/doctors', { state: { userId: msid } }); 
    };

    return (
        <div>
            <MedSecNavbar msid={msid} />
            <Container fluid style={{ overflowY: 'auto', height: 'calc(100vh - 100px)', width: '100%', paddingBottom: '1.5rem' }}>
                <div style={{ paddingLeft: '5rem', paddingRight: '5rem' }} className='pt-5'>
                    {/* Back Button */}
                    <Button variant="link" className="text-dark mb-4" onClick={handleBackClick}>
                        <FontAwesomeIcon icon={faChevronLeft} className="me-2" />
                        Back to Doctors List
                    </Button>

                    {/* Tabs for switching between sections */}
                    <Row>
                        <Nav fill variant="tabs" className='navtabs-pxmanagement' activeKey={activeTab} onSelect={(tab) => setActiveTab(tab)}>
                            <Nav.Item>
                                <Nav.Link eventKey="profile">Doctor Profile & Schedule</Nav.Link>
                            </Nav.Item>
                            {/* <Nav.Item>
                                <Nav.Link eventKey="appointments">Doctor's Appointments</Nav.Link>
                            </Nav.Item> */}
                        </Nav>
                    </Row>

                    {/* Conditional rendering based on the active tab */}
                    <Row style={{ marginTop: '20px', marginBottom: '20px' }}>
                        {activeTab === 'profile' && (
                            <>
                                <Container>
                                </Container>
                                <Col md={6}>
                                    <MSDoctorProfile did={did} msid={msid} />
                                </Col>
                                <Col md={6}>
                                    <DoctorScheduleManagement did={did} msid={msid} />
                                </Col>
                            </>
                        )}
                        {activeTab === 'appointments' && (
                            <Col md={12}>
                                <SpecificDoctorAppointments did={did} />
                            </Col>
                        )}
                    </Row>
                </div>
            </Container>
        </div>
    );
}

export default ManageDoctorMain;
