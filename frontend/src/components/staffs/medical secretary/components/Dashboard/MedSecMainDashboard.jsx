import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Collapse } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import MedSecDashboard from './MedSecDashboard';
import MedSecNavbar from '../../navbar/MedSecNavbar';
import NewsAnnouncement from '../../../news/NewsAnnouncement';
import axios from 'axios';
import BarAppointment from '../../../admin/dashboard/Charts/BarAppointment';
import LineCompletedAppointments from '../../../admin/dashboard/Charts/LineCompletedAppointments';
import AppointmentFullCalendar from '../Calendar/AppointmentFullCalendar';
import { ip } from '../../../../../ContentExport';
import ChatComponent from '../../../../chat/ChatComponent';
import { ChatDotsFill } from 'react-bootstrap-icons';
import { useUser } from '../../../../UserContext';
import DeactivationRequestMedSec from './DeactivationRequestMedSec';

function MedSecMainDashboard() {
    const location = useLocation();  // Retrieve state from location
    const { userId, userName, role } = location.state || {};  // Destructure the passed data
    const [showChat, setShowChat] = useState(false);
    const [medSecData, setMedSecData] = useState(null);
    const [error, setError] = useState(null);  // Handle error state
    const [openProfile, setOpenProfile] = useState(false);

    const navigate = useNavigate();

    const navigateToAppointment = () => {
        navigate('/medsec/appointments');
    };

    const { user } = useUser();
    console.log(user._id)

    useEffect(() => {
        if (user._id) {
            axios.get(`${ip.address}/api/medicalsecretary/api/findone/${user._id}`)
                .then((res) => {
                    const medsec = res.data.theMedSec;
                    setMedSecData(medsec);
                })
                .catch((err) => {
                    console.error('Error fetching Medical Secretary data:', err);
                    setError('Failed to fetch data');
                });
        }
    }, [user._id]);

    return (
        <>
            <div>
                <div>
                   
                    <Container fluid className='px-0' style={{ overflowY: 'auto', height: 'calc(100vh)', width: '100%', paddingBottom: '1.5rem', overflowX: 'hidden' }} >
                        <div className="maincolor-container p-0" style={{ overflowX: 'hidden' }}>
                        <MedSecNavbar msid={user._id} />
                            <div className="content-area p-0">
                                <Row>
                                    <Col>

                                        <div fluid className=" w-100 d-flex justify-content-center ">
                                            <div className="position-relative ">
                                                <img className=" dm-photo  " src={`${ip.address}/images/Dashboard-Photo.png`} alt="Dashboard" />
                                                <div className="overlay-content position-absolute top-50 start-0 translate-middle-y text-start p-4 image-overlay-padding">
                                                    <p className="fs-3 fs-md-4 fs-sm-5 text-white">Welcome!</p>
                                                    <p className="fs-2 fs-md-3 fs-sm-4 text-white">{userName}</p>
                                                    <p className="fs-6 fs-md-6 fs-sm-7 text-white mb-4">Here you can manage your appointments, view your patients, and post announcements.</p>
                                                    <button className="btn btn-primary" onClick={navigateToAppointment} >View your Appointments</button>
                                                </div>
                                            </div>
                                        </div>

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
                                                        userId={user._id}
                                                        userRole={user.role}
                                                    closeChat={() => setShowChat(false)}
                                                    />
                                                </div>
                                                )}
                                            </div>
                                        )}


                                    </Col>

                                </Row>

                                <Container fluid className=' w-100 px-5 pt-5'>
                                    <Row >
                                        <Col md={2} className='pt-3'>
                                            <MedSecDashboard />
                                        </Col>
                                        <Col md={5} className='pt-3'>
                                            <BarAppointment />
                                        </Col>
                                        <Col md={5} className='pt-3'>
                                            <LineCompletedAppointments />

                                        </Col>
                                    </Row>
                                </Container>

                                <Container fluid className='px-5 pt-4'>
                                    <Row className='pt-3' >
                                        <Col md={4} className='pt-3'>
                                            <AppointmentFullCalendar msid={user._id} />
                                        </Col>
                                        <Col md={5} className='pt-3'>
                                            <NewsAnnouncement role={user.role} user_id={user._id} user_name={userName} /> {/* News announcements */}


                                        </Col>

                                        <Col md={3} className='pt-3'>
                                            <DeactivationRequestMedSec />
                                        </Col>

                                    </Row>
                                </Container>
                            </div>
                        </div>
                    </Container>
                </div>
            </div>
        </>
    );
}

export default MedSecMainDashboard;