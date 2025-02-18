// MyAppointment.js

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import axios from 'axios';
import PatientNavBar from '../PatientNavBar/PatientNavBar';
import './Appointment.css';
import ActiveAppointment from './Appointments';
import CancelledAppointments from './CancelledAppointments';
import CompleteAppointment from './CompleteAppointment';
import PendingAppointments from './PendingAppointment';
import RescheduledAppointment from './RescheduledAppointments';
import { Helmet } from 'react-helmet';
import Footer from '../../Footer';
import { ip } from '../../../ContentExport';
import AppointmentStepper from './AppointmentStepper';
import socket from '../../../socket'; // Import the socket connection
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../UserContext';
function MyAppointment() {
  const [activeTab, setActiveTab] = useState('pending');
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  const { user } = useUser(); 

  useEffect(() => {
    if (!user) {
      navigate('/medapp/login'); // Redirect to login if patient is not available
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchAppointments = () => {
      axios
        .get(`${ip.address}/api/patient/api/onepatient/${user._id}`)
        .then((res) => {
          const fetchedAppointments = res.data.thePatient.patient_appointments;
          const inactiveStatuses = ['Cancelled', 'Completed', 'Rescheduled', 'Missed'];
          const sortedAppointments = fetchedAppointments.sort((a, b) => {
            if (inactiveStatuses.includes(a.status) && !inactiveStatuses.includes(b.status)) return 1;
            if (!inactiveStatuses.includes(a.status) && inactiveStatuses.includes(b.status)) return -1;
    
            return new Date(b.date) - new Date(a.date);
          });

          setAppointments(sortedAppointments);
        })
        .catch((err) => {
          console.log(err);
        });
    };

    fetchAppointments();

    // Set up Socket.IO
    socket.emit('identify', { userId: user._id, userRole: 'Patient' });

    // Listen for appointment status updates
    socket.on('appointmentStatusUpdate', (data) => {
      console.log('Received appointment status update:', data);

      // Update the specific appointment in state
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === data.appointmentId ? { ...appointment, status: data.status } : appointment
        )
      );
    });

    // Clean up on unmount
    return () => {
      socket.off('appointmentStatusUpdate');
    };
  }, [user._id]);

  // Get the latest active appointment
  const latestAppointment = appointments.find(
    (appointment) => !['Missed'].includes(appointment.status)
  );



  if (!user) {
    return null; // Optionally, display a loading spinner or placeholder
  }

  return (
    <>
      <Helmet>
        <title>Molino Care | Patient</title>
      </Helmet>

      <Container className="cont-fluid-no-gutter" fluid style={{ overflowY: 'scroll', height: '100vh' }}>
        <PatientNavBar pid={user._id} />
        <div className="maincolor-container">
          <div className="content-area">
            <Container>
              <h2>My Appointments</h2>
              <p className="text-muted">See your appointment details.</p>
            </Container>

            <Container>
              <Row>
                <Col md={8}>
                  <Container className="d-flex content-area">
                    <Nav fill variant="tabs" className="app-navtabs" activeKey={activeTab}>
                      <Nav.Item>
                        <Nav.Link eventKey="pending" onClick={() => setActiveTab('pending')}>
                          Pending
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="active" onClick={() => setActiveTab('active')}>
                          Scheduled
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="completed" onClick={() => setActiveTab('completed')}>
                          Completed
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="cancel" onClick={() => setActiveTab('cancel')}>
                          Cancelled
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="rescheduled" onClick={() => setActiveTab('rescheduled')}>
                          Rescheduled
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Container>

                  <div className="content-area mb-5">
                    {activeTab === 'pending' && (
                      <PendingAppointments appointments={appointments} setAppointments={setAppointments} />
                    )}
                    {activeTab === 'active' && (
                      <ActiveAppointment appointments={appointments} setAppointments={setAppointments} />
                    )}
                    {activeTab === 'cancel' && (
                      <CancelledAppointments appointments={appointments} setAppointments={setAppointments} />
                    )}
                    {activeTab === 'completed' && (
                      <CompleteAppointment appointments={appointments} setAppointments={setAppointments} />
                    )}
                    {activeTab === 'rescheduled' && (
                      <RescheduledAppointment appointments={appointments} setAppointments={setAppointments} />
                    )}
                  </div>
                </Col>

                <Col>
                  <Container>
                    {latestAppointment ? (
                      <AppointmentStepper
                        currentStatus={latestAppointment.status}
                        latestAppointment={latestAppointment} // Pass the latest appointment
                      />
                    ) : (
                      <p>No active appointments.</p>
                    )}
                  </Container>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      </Container>
    </>
  );
}

export default MyAppointment;
