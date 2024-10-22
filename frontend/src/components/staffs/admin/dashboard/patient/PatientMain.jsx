import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col } from 'react-bootstrap';
import '../../AdminStyles.css';
import AdminNavbar from '../../navbar/AdminNavbar';
import PatientStatsCards from '../cards/PatientStatsCards';
import { ip } from '../../../../../ContentExport';
import BarAppointment from '../Charts/BarAppointment';
import SidebarAdmin from '../../sidebar/SidebarAdmin';
import LineCompletedAppointments from '../Charts/LineCompletedAppointments';

function PatientMain() {
  const location = useLocation();
  const { userId, userName, role } = location.state || {};
  const navigate = useNavigate();

  // Retrieve state from location
 

  // If state is missing, redirect to login
//   useEffect(() => {
//     if (!userId) {
//       navigate('/'); // Redirect to login if state is missing
//     }
//   }, [userId, navigate]);

  const [totalPatients, setTotalPatients] = useState(0);
  const [registeredPatients, setRegisteredPatients] = useState(0);
  const [unregisteredPatients, setUnregisteredPatients] = useState(0);

  useEffect(() => {
    axios.get(`${ip.address}/api/admin/api/patients/count`)
      .then(response => setTotalPatients(response.data.totalPatients))
      .catch(error => console.error('Error fetching total patients:', error));

    axios.get(`${ip.address}/api/admin/api/patients/registered/count`)
      .then(response => setRegisteredPatients(response.data.registeredPatients))
      .catch(error => console.error('Error fetching registered patients:', error));

    axios.get(`${ip.address}/api/admin/api/patients/unregistered/count`)
      .then(response => setUnregisteredPatients(response.data.unregisteredPatients))
      .catch(error => console.error('Error fetching unregistered patients:', error));
  }, []);

  return (
    <div className="d-flex justify-content-center">
      <SidebarAdmin userId={userId} userName={userName} role={role} />
      <div style={{ width: '100%' }}>
        <AdminNavbar userId={userId} userName={userName} role={role} />
        <Container fluid className="ad-container p-5" style={{ height: 'calc(100vh - 56px)', overflowY: 'auto' }}>
          <PatientStatsCards 
            totalPatients={totalPatients} 
            registeredPatients={registeredPatients} 
            unregisteredPatients={unregisteredPatients} 
          />
          <Row className="mt-4">
            <Col md={6}>
              <BarAppointment />
            </Col>
            <Col md={6}>
              <LineCompletedAppointments />
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default PatientMain;
