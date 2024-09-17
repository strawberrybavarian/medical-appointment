import React, { useState } from 'react';
import DoctorScheduleManagement from './DoctorScheduleManagement';
import MSDoctorProfile from './MSDoctorProfile';
import MedSecNavbar from '../../navbar/MedSecNavbar';
import SpecificDoctorAppointments from './SpecificDoctorAppointments';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import DeactivationRequests from '../../../admin/appointment/doctors/DeactivationRequests';
function ManageDoctorMain() {
    const { did, msid } = useParams();
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div>
            <MedSecNavbar did={did} msid={msid} />
            <Container fluid style={{ overflowY: 'auto', height: 'calc(100vh - 100px)', width: '100%', paddingBottom: '1.5rem' }}>
                <div style={{paddingLeft: '5rem' , paddingRight: '5rem'}} className='pt-5'>
                    {/* Tabs for switching between sections */}
                    <Row>
                        <Nav fill variant="tabs" className='navtabs-pxmanagement' activeKey={activeTab} onSelect={(tab) => setActiveTab(tab)}>
                            <Nav.Item>
                                <Nav.Link eventKey="profile">Doctor Profile & Schedule</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="appointments">Doctor's Appointments</Nav.Link>
                            </Nav.Item>
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
