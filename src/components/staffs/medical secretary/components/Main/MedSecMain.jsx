import { useParams, useLocation } from 'react-router-dom';
import MedSecNavbar from '../../navbar/MedSecNavbar';
import MedSecTodaysApp from '../Appointments/MedSecTodaysApp';
import MedSecPending from '../Appointments/MedSecPending';
import MedSecOngoing from '../Appointments/MedSecOngoing';
import MedSecForPayment from '../Appointments/MedSecForPayment';
import { Container, Nav, Row, Col, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './MedSecMain.css';
import CreatePatientForms from '../Add Patient/Forms/CreatePatientForms';
import CreateAppointment from '../Add Patient/New Appointment/CreateAppointment';

function MedSecMain() {
  const { msid } = useParams();
  const location = useLocation(); 
  const [allappointments, setallappointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [showPatientModal, setShowPatientModal] = useState(false); // Modal for Add Patient
  const [showAppointmentModal, setShowAppointmentModal] = useState(false); // Modal for Create Appointment

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]); 

  useEffect(() => {
    axios.get(`http://localhost:8000/medicalsecretary/api/allappointments`)
      .then((result) => {
        setallappointments(result.data.Appointments);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // Functions to control modals
  const handleShowPatientModal = () => setShowPatientModal(true);
  const handleClosePatientModal = () => setShowPatientModal(false);

  const handleShowAppointmentModal = () => setShowAppointmentModal(true);
  const handleCloseAppointmentModal = () => setShowAppointmentModal(false);

  return (
    <>
      <MedSecNavbar /> 
      <Container className='cont-fluid-no-gutter' fluid style={{overflowY: 'scroll', height: '100vh', paddingBottom: '100px', paddingTop: '1.5rem'}}>
        
        <div className='maincolor-container'>
          <div className='content-area'>
            <Container className="d-flex justify-content-center ">
              <Row>
                <Nav fill variant="tabs" className="app-navtabs" activeKey={activeTab} onSelect={setActiveTab}>
                  <Nav.Item>
                    <Nav.Link eventKey="pending">Pending Appointments</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="todays">Today's Appointments</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="ongoing">Ongoing Appointments</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="forpayment">For Payment</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Row>
            </Container>

            <Container className="d-flex justify-content-center" style={{ marginTop: '2rem' }}>
              <Row>
                <Col>
                  {/* Button to open Create Appointment modal */}
                 
                  <Container className="ai-container2 shadow-sm">
                    <Container className='m-0 p-0 d-flex justify-content-end'>
                      <Button variant="primary" onClick={handleShowAppointmentModal} className="mb-3">
                        Create Appointment
                      </Button>
                      {/* Button to open Add Patient modal */}
                      <Button variant="secondary" onClick={handleShowPatientModal} className="mb-3 ml-3">
                        Add Patient
                      </Button>
                    </Container>
                  
                    
                    {activeTab === "todays" && (
                      <MedSecTodaysApp
                        allAppointments={allappointments}
                        setAllAppointments={setallappointments}
                        selectedDoctor={selectedDoctor}
                      />
                    )}
                    {activeTab === "pending" && (
                      <MedSecPending
                        allAppointments={allappointments}
                        setAllAppointments={setallappointments}
                        selectedDoctor={selectedDoctor}
                      />
                    )}
                    {activeTab === "ongoing" && (
                      <MedSecOngoing
                        allAppointments={allappointments}
                        setAllAppointments={setallappointments}
                        selectedDoctor={selectedDoctor}
                      />
                    )}
                    {activeTab === "forpayment" && (
                      <MedSecForPayment
                        allAppointments={allappointments}
                        setAllAppointments={setallappointments}
                        selectedDoctor={selectedDoctor}
                      />
                    )}
                  </Container>
                </Col>
              </Row>
            </Container>

          </div>
        </div>
        
        {/* Modal for creating a patient */}
        <Modal show={showPatientModal} onHide={handleClosePatientModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Create New Patient</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <CreatePatientForms onClose={handleClosePatientModal} />
          </Modal.Body>
        </Modal>

        {/* Modal for creating an appointment */}
        <Modal show={showAppointmentModal} onHide={handleCloseAppointmentModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Create New Appointment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <CreateAppointment onClose={handleCloseAppointmentModal} />
          </Modal.Body>
        </Modal>

      </Container>
    </>
  );
}

export default MedSecMain;
