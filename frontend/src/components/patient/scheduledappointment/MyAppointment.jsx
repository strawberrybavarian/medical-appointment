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
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Footer from '../../Footer';
import { ip } from '../../../ContentExport';
import AppointmentStepper from './AppointmentStepper';
import socket from '../../../socket'; // Import the socket connection

function MyAppointment() {
  const [activeTab, setActiveTab] = useState('pending');
  const [appointments, setAppointments] = useState([]);
  const location = useLocation();
  const { pid } = location.state || {};

  useEffect(() => {
    // Fetch appointments
    const fetchAppointments = () => {
      axios
        .get(`${ip.address}/api/patient/api/onepatient/${pid}`)
        .then((res) => {
          const fetchedAppointments = res.data.thePatient.patient_appointments;

          // Define inactive statuses
          const inactiveStatuses = ['Cancelled', 'Completed', 'Rescheduled', 'Missed'];

          // Sort appointments to prioritize active ones
          const sortedAppointments = fetchedAppointments.sort((a, b) => {
            if (inactiveStatuses.includes(a.status) && !inactiveStatuses.includes(b.status)) return 1;
            if (!inactiveStatuses.includes(a.status) && inactiveStatuses.includes(b.status)) return -1;
            // If both have the same status, sort by date descending
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
    socket.emit('identify', { userId: pid, userRole: 'Patient' });

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
  }, [pid]);

  // Get the latest active appointment
  const latestAppointment = appointments.find(
    (appointment) => !['Missed'].includes(appointment.status)
  );

  return (
    <>
      <Helmet>
        <title>Molino Care | Patient</title>
      </Helmet>

      <Container className="cont-fluid-no-gutter" fluid style={{ overflowY: 'scroll', height: '100vh' }}>
        <PatientNavBar pid={pid} />
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
          <Container fluid className="footer-container cont-fluid-no-gutter">
            <Footer />
          </Container>
        </div>
      </Container>
    </>
  );
}

export default MyAppointment;
