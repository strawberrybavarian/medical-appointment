
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { Container, Row, Col } from 'react-bootstrap';
import { useLocation, useParams } from 'react-router-dom';
import SidebarAdmin from '../../sidebar/SidebarAdmin';
import PieSpecialization from '../Charts/PieSpecialization';
import DoctorStatsCards from '../cards/DoctorStatsCards';
import { ip } from '../../../../../ContentExport';
import AdminNavbar from '../../navbar/AdminNavbar';

import DeactivationRequests from '../../appointment/doctors/DeactivationRequests';
import DoctorAgeGroupChart from '../Charts/DoctorAgeGroupChart';
function DoctorMain() {
    const [totalDoctors, setTotalDoctors] = useState(0);
    const [registeredDoctors, setRegisteredDoctors] = useState(0);
    const [reviewedDoctors, setReviewedDoctors] = useState(0);
    const [onlineDoctors, setOnlineDoctors] = useState(0);
    const [inSessionDoctors, setInSessionDoctors] = useState(0);
    const location = useLocation();
    const { userId, userName, role } = location.state || {};

    useEffect(() => {
        axios.get(`${ip.address}/api/admin/api/doctors/count`)
            .then(response => {
                setTotalDoctors(response.data.totalDoctors);
            })
            .catch(error => {
                console.error('Error fetching total doctors:', error);
            });

        axios.get(`${ip.address}/api/admin/api/doctors/registered/count`)
            .then(response => {
                setRegisteredDoctors(response.data.registeredDoctors);
            })
            .catch(error => {
                console.error('Error fetching registered doctors:', error);
            });

        axios.get(`${ip.address}/api/admin/api/doctors/reviewed/count`)
            .then(response => {
                setReviewedDoctors(response.data.reviewedDoctors);
            })
            .catch(error => {
                console.error('Error fetching unregistered patients:', error);
            });
        
        axios.get(`${ip.address}/api/admin/api/doctors/online-status/count`)
            .then(response => {
                setOnlineDoctors(response.data.onlineDoctors);
            })
            .catch(error => {
                console.error('Error fetching online doctors:', error);
            })
        
        axios.get(`${ip.address}/api/admin/api/doctors/insession-status/count`)
            .then(response => {
                setInSessionDoctors(response.data.insessionDoctors);
            })
            .catch(error => {
                console.error('Error fetching online doctors:', error);
            })
    


        

        
    }, []);
  return (
   <>
        <div className="d-flex justify-content-center">
                <SidebarAdmin userId={userId} userName={userName} role={role} />
                <Container className='cont-fluid-no-gutter'fluid style={{ width: '100%', height: '100vh', overflowY: 'auto' }}>
                    <AdminNavbar userId={userId} userName={userName} role={role} />
                    <Container fluid className="ad-container p-5" style={{  overflowY: 'hidden' }}>
                        <DoctorStatsCards 
                            totalDoctors={totalDoctors} 
                            registeredDoctors={registeredDoctors} 
                            reviewedDoctors={reviewedDoctors}
                            onlineDoctors={onlineDoctors}
                            inSessionDoctors={inSessionDoctors}
                        />

                        {/* <DoctorStatsCards
                            totalDoctors={totalDoctors}
                        /> */}
                        <Row>
                            <Col md={4}>
                                <div className="d-flex justify-content-between" style={{ paddingTop: '1.5rem' }}> 
                                    <PieSpecialization/>

                                </div>
                            </Col>

                            <Col md={4}>
                                <div className="d-flex justify-content-between" style={{ paddingTop: '1.5rem' }}> 
                                    <DoctorAgeGroupChart/>
                                </div>
                            </Col>

                            <Col md={4}>

                                <div className="d-flex justify-content-between" style={{ paddingTop: '1.5rem', width: '100%' }}> 
                                    
                                    <DeactivationRequests/>
                                </div>
                            </Col>
                        </Row>

                    </Container>
                </Container>
        </div>
   
   </>
  )
}

export default DoctorMain