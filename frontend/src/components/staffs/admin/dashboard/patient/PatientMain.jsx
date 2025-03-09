import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Button } from 'react-bootstrap';
import '../../AdminStyles.css';
import AdminNavbar from '../../navbar/AdminNavbar';
import PatientStatsCards from '../cards/PatientStatsCards';
import { ip } from '../../../../../ContentExport';
import BarAppointment from '../Charts/BarAppointment';
import SidebarAdmin from '../../sidebar/SidebarAdmin';
import LineCompletedAppointments from '../Charts/LineCompletedAppointments';
import BarPatientAgeGroup from '../Charts/PatientAgeGroupChart';

import ChatComponent from '../../../../chat/ChatComponent';
import { ChatDotsFill } from 'react-bootstrap-icons';
import { useUser } from '../../../../UserContext';
function PatientMain() {
  

  const { user } = useUser();
  const userId = user._id;
  const userName = user.firstName + ' ' + user.lastName;
  const role = user.role;
  // console.log('user', user)
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
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
  const [todaysPatients, setTodaysPatients] = useState(0);

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
      <Container className='cont-fluid-no-gutter' fluid style={{ width: '100%', height: '100vh', overflowY: 'auto' }}>


        <AdminNavbar userId={userId} userName={userName} role={role} />
        <Container fluid className="ad-container p-5" style={{ overflowY: 'hidden' }}>
          <PatientStatsCards
            totalPatients={totalPatients}
            registeredPatients={registeredPatients}
            unregisteredPatients={unregisteredPatients}
            todaysPatients={todaysPatients}
          />
          <Row className="mt-4">
            <Col md={4}>
              <BarAppointment />
            </Col>

            <Col md={4}>
              <BarPatientAgeGroup/>
            </Col>
            <Col md={4}>
              <LineCompletedAppointments />

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
                          userId={userId}
                          userRole={role}
                          closeChat={() => setShowChat(false)}
                        />
                      </div>
                    )}
                  </div>
                )}
            </Col>

            
          </Row>
        </Container>
      </Container>
    </div>
  );
}

export default PatientMain;
