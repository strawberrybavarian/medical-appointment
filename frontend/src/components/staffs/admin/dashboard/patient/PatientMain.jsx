import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { Container, Row , Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import '../../AdminStyles.css'
import AdminNavbar from '../../navbar/AdminNavbar';
import PatientStatsCards from '../cards/PatientStatsCards';
import { ip } from '../../../../../ContentExport';
import BarAppointment from '../Charts/BarAppointment';

import SidebarAdmin from '../../sidebar/SidebarAdmin';
import LineCompletedAppointments from '../Charts/LineCompletedAppointments';

function PatientMain() {
    const [totalPatients, setTotalPatients] = useState(0);
    const [registeredPatients, setRegisteredPatients] = useState(0);
    const [unregisteredPatients, setUnregisteredPatients] = useState(0);
    const [totalDoctors, setTotalDoctors] = useState(0);
    const { aid } = useParams();

    useEffect(() => {
        axios.get(`${ip.address}/admin/api/patients/count`)
            .then(response => {
                setTotalPatients(response.data.totalPatients);
            })
            .catch(error => {
                console.error('Error fetching total patients:', error);
            });

        axios.get(`${ip.address}/admin/api/patients/registered/count`)
            .then(response => {
                setRegisteredPatients(response.data.registeredPatients);
            })
            .catch(error => {
                console.error('Error fetching registered patients:', error);
            });

        axios.get(`${ip.address}/admin/api/patients/unregistered/count`)
            .then(response => {
                setUnregisteredPatients(response.data.unregisteredPatients);
            })
            .catch(error => {
                console.error('Error fetching unregistered patients:', error);
            });
        


        

        
    }, []);

    return (
        <>
            <div className="d-flex justify-content-center">
                <SidebarAdmin aid={aid} />
                <div style={{ width: '100%' }}>
                    <AdminNavbar />
                    <Container fluid className='ad-container p-5' style={{ height: 'calc(100vh - 56px)', overflowY: 'auto',  padding: '20px'}}>
                        <PatientStatsCards 
                            totalPatients={totalPatients} 
                            registeredPatients={registeredPatients} 
                            unregisteredPatients={unregisteredPatients}
                        />


                    <Row className="mt-4">
                        <Col md={6} className="mb-3">
                        <BarAppointment />
                        
                        </Col>

                        <Col md={6} className="mb-3">
                        <LineCompletedAppointments/>
                        </Col>
                    </Row>
                        
                        
                        
                
                    </Container>
                </div>
            </div>
        </>
    );
}

export default PatientMain;
