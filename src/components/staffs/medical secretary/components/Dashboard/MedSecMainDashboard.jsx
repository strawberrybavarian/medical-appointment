import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap'; // Import Row and Col
import { useParams } from 'react-router-dom';
import MedSecDashboard from './MedSecDashboard';
import MedSecNavbar from '../../navbar/MedSecNavbar';
import NewsAnnouncement from '../../../news/NewsAnnouncement';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';
import BarAppointment from '../../../admin/dashboard/charts/BarAppointment';
import LineCompletedAppointments from '../../../admin/dashboard/charts/LineCompletedAppointments';
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
            <MedSecNavbar /> {/* Fixed navbar at the top */}
            <div className="maincolor-container" style={{ overflowY: 'auto', height: 'calc(100vh - 90px)', width: '100%' }}>
                <Container>
                    <MedSecDashboard />
                    
                    <Row className="mt-4">
                        <Col md={6} className="mb-3">
                            <BarAppointment /> {/* Appointment bar chart */}
                            <LineCompletedAppointments/>
                        
                        </Col>

                        <Col md={6} className="mb-3">
                            <NewsAnnouncement role={role} user_id={msid} user_name={name} /> {/* News announcements */}
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
}

export default MedSecMainDashboard;
