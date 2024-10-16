import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap'; 
import { useLocation } from 'react-router-dom';
import MedSecDashboard from './MedSecDashboard';
import MedSecNavbar from '../../navbar/MedSecNavbar';
import NewsAnnouncement from '../../../news/NewsAnnouncement';
import axios from 'axios';
import BarAppointment from '../../../admin/dashboard/Charts/BarAppointment';
import LineCompletedAppointments from '../../../admin/dashboard/Charts/LineCompletedAppointments';
import AppointmentFullCalendar from '../Calendar/AppointmentFullCalendar';
import { ip } from '../../../../../ContentExport';

function MedSecMainDashboard() {
    const location = useLocation();  // Retrieve state from location
    const { userId, userName, role } = location.state || {};  // Destructure the passed data

    const [medSecData, setMedSecData] = useState(null); 
    const [error, setError] = useState(null);  // Handle error state
    
    useEffect(() => {
        if (userId) {
            axios.get(`${ip.address}/api/medicalsecretary/api/findone/${userId}`)
            .then((res) => {
                const medsec = res.data.theMedSec;
                setMedSecData(medsec); 
            })
            .catch((err) => {
                console.error('Error fetching Medical Secretary data:', err);
                setError('Failed to fetch data');
            });
        }
    }, [userId]);

    return (
        <>
            <div>
                <div>
                    <MedSecNavbar msid={userId}/>
                    <Container fluid style={{ overflowY: 'auto', height: 'calc(100vh - 100px)', width: '100%', paddingBottom: '1.5rem' }}>
                        <div className="maincolor-container p-0">
                            <div className="content-area p-0">
                                <Row>
                                    <Col md={8}>
                                        <div className="w-100 d-flex justify-content-center mt-5  position-relative " style={{paddingLeft:'4rem'}}>
                                            <div className="position-relative">
                                                <img className="img-fluid dm-photo shadow-lg" src={`${ip.address}/images/Dashboard-Photo.png`} alt="Dashboard" />         
                                                    <div className="overlay-content position-absolute top-50 start-0 translate-middle-y text-start p-4">
                                                        <p className="fs-3 fs-md-4 fs-sm-5 text-white">Welcome!</p>
                                                        <p className="fs-2 fs-md-3 fs-sm-4 text-white">{userName}</p>
                                                        <p className="fs-6 fs-md-6 fs-sm-7 text-white mb-4">Here you can manage your appointments, view your patients, and post announcements.</p>
                                                        <button className="btn btn-primary" >View your Appointments</button>
                                                    </div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <Container fluid className='flex-column pt-4'>
                                            <MedSecDashboard />
                                        </Container>
                                    </Col>
                                </Row>
                                
                               
                                <Container fluid className='px-5'>
                                    <Row className="mt-4 w-100 p-0 m-0">
                                        <Col md={4} className="mb-3">
                                            <AppointmentFullCalendar msid={userId} />
                                        </Col>
                                        <Col md={4} className="mb-3 mt-3">
                                        <NewsAnnouncement role={role} user_id={userId} user_name={userName} /> {/* News announcements */}
                                           
                                           
                                        </Col>
                                            <Col md={4} className="mb-3 mt-1">
                                            <BarAppointment />
                                            <LineCompletedAppointments />
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