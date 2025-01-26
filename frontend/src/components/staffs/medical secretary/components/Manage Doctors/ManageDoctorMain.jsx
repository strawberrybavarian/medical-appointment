import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import DoctorScheduleManagement from './DoctorScheduleManagement';
import MSDoctorProfile from './MSDoctorProfile';
import MedSecNavbar from '../../navbar/MedSecNavbar';
import SpecificDoctorAppointments from './SpecificDoctorAppointments';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Nav, Button, Modal } from 'react-bootstrap'; // Added Modal
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'; // Import Chevron Left icon

function ManageDoctorMain({did, msid, showModal}) {
    const location = useLocation();
 
    
    const navigate = useNavigate();
    console.log('Received did:', did);
    console.log('Received msid:', msid);
    
    const [activeTab, setActiveTab] = useState('profile');
    const [show, setShow] = useState(!!showModal); // Use modal state



    return (

                <div>
                    
                    <Container fluid style={{ overflowY: 'auto', height: 'calc(100vh - 100px)', width: '100%', paddingBottom: '1.5rem' }}>
                        <div style={{ paddingLeft: '5rem', paddingRight: '5rem' }} className='pt-5'>
                         


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
                               
                            </Row>
                        </div>
                    </Container>
                </div>

    );
}

export default ManageDoctorMain;