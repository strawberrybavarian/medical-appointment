import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap'; // Import Row and Col
import { useParams } from 'react-router-dom';
import MedSecDashboard from './MedSecDashboard';
import MedSecNavbar from '../../navbar/MedSecNavbar';
import NewsAnnouncement from '../../../news/NewsAnnouncement';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';
import BarAppointment from '../../../admin/dashboard/Charts/BarAppointment';
import LineCompletedAppointments from '../../../admin/dashboard/Charts/LineCompletedAppointments';
import AppointmentFullCalendar from '../Calendar/AppointmentFullCalendar';
function MedSecMainDashboard() {
    const { msid } = useParams();  // Extract msid from the route
    const [medSecData, setMedSecData] = useState(null); 
    const [role, setRoles] = useState('');
    const [name, setName] = useState(''); // Add a state to store the data
    const [error, setError] = useState(null);  // Handle error state

    useEffect(() => {
        axios.get(`${ip.address}/medicalsecretary/api/findone/${msid}`)
        .then((res) => {
            console.log('Medical Secretary Data:', res.data.theMedSec.role);
            const medsec = res.data.theMedSec;
            setMedSecData(medsec); 
            setRoles(medsec.role);
            
            const fullName = medsec.ms_firstName + ' ' + medsec.ms_lastName;
            setName(fullName);
        })
        .catch((err) => {
            console.error('Error fetching Medical Secretary data:', err);
            setError('Failed to fetch data');
        });
    }, [msid]);

    return (
        <>

            <div className="d-flex justify-content-center m-0 p-0">
                <div style={{ width: '100%' }}>
                    <MedSecNavbar />


                    <Container className='cont-fluid-no-gutter' fluid style={{overflowY: 'scroll', height: '100vh', paddingBottom: '100px', paddingTop: '1.5rem'}}>
                        
                        
                    <div className="maincolor-container">
                        <div className="content-area">
                        
                            <div className="w-100 d-flex justify-content-center mt-5 position-relative">
                                <div className="position-relative">
                                    <img className="img-fluid dm-photo shadow-lg" src={`${ip.address}/images/Dashboard-Photo.png`} alt="Dashboard" />         
                                        <div className="overlay-content position-absolute top-50 start-0 translate-middle-y text-start p-4">
                                            <p className="fs-3 fs-md-4 fs-sm-5 text-white">Welcome!</p>
                                            <p className="fs-2 fs-md-3 fs-sm-4 text-white">Mahra Amil</p>
                                            <p className="fs-6 fs-md-6 fs-sm-7 text-white mb-4">Here you can manage your appointments, view your patients, and post announcements.</p>
                                            <button className="btn btn-primary" >View your Appointments</button>
                                        </div>
                                </div>
                            </div>
                            <Container>
                                <MedSecDashboard />

                                <Row className="mt-4">
                                    <Col md={6} className="mb-3">
                                        <AppointmentFullCalendar/>
                                        <BarAppointment /> {/* Appointment bar chart */}
                                        <LineCompletedAppointments/>
                                    
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <NewsAnnouncement role={role} user_id={msid} user_name={name} /> {/* News announcements */}
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
