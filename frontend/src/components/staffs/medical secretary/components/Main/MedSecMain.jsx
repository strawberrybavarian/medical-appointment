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
import MedSecLaboratoryApp from '../Appointments/MedSecLaboratoryApp';
import MedSecToSend from '../Appointments/MedSecToSend';
import { ip } from '../../../../../ContentExport';
function MedSecMain() {
  
  const location = useLocation(); 
  const { userId, userName, role } = location.state || {};
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
    axios.get(`${ip.address}/api/medicalsecretary/api/allappointments`)
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
      <MedSecNavbar msid={userId} /> 
      <Container fluid style={{ overflowY: 'auto', height: 'calc(100vh - 100px)', width: '100%', paddingBottom: '1.5rem' }}>
        
        <div className='maincolor-container'>
          <div className='content-area'>
            <Container className="d-flex justify-content-center ">
              <Row>
                <Nav fill variant="tabs" className="app-navtabs" activeKey={activeTab} onSelect={setActiveTab}>
                  {/* <Nav.Item>
                    <Nav.Link eventKey="laboratory">Laboratory</Nav.Link>
                  </Nav.Item> */}
                  
                  <Nav.Item>
                    <Nav.Link eventKey="pending">Pending</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="todays">Today's</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="ongoing">Ongoing</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="forpayment">For Payment</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="tosend">To-send Lab Results</Nav.Link>
                  </Nav.Item>
             
               
                 
                </Nav>
           
                
                 
              </Row>
            </Container>

            <Container  fluid className="d-flex justify-content-center w-100" style={{ marginTop: '2rem' }}>

                  {/* Button to open Create Appointment modal */}
                 
                  <Container className="ai-container2 shadow-sm">
                   
                  
                    
                    {activeTab === "todays" && (
                      <>
                       <Container fluid className=' w-100 m-0 p-0 d-flex justify-content-end'>
                          <Button variant="primary" onClick={handleShowAppointmentModal} className="mb-3">
                            Create Appointment
                          </Button>
                          {/* Button to open Add Patient modal */}
                          <Button variant="secondary" onClick={handleShowPatientModal} className="mb-3 ml-3">
                            Add Patient
                          </Button>
                        </Container>



                    <MedSecTodaysApp
                        allAppointments={allappointments}
                        setAllAppointments={setallappointments}
                        selectedDoctor={selectedDoctor}
                      />
                      </>
                    
                    )}
                    {activeTab === "pending" && (
                      <>
                        <Container className='m-0 p-0 d-flex justify-content-end'>
                          <Button variant="primary" onClick={handleShowAppointmentModal} className="mb-3">
                            Create Appointment
                          </Button>
                          {/* Button to open Add Patient modal */}
                          <Button variant="secondary" onClick={handleShowPatientModal} className="mb-3 ml-3">
                            Add Patient
                          </Button>
                        </Container>
                        <MedSecPending
                        allAppointments={allappointments}
                        setAllAppointments={setallappointments}
                        selectedDoctor={selectedDoctor}
                      />
                      </>
                     
                    )}
                    {activeTab === "ongoing" && (
                      <>
                        <Container className='m-0 p-0 d-flex justify-content-end'>
                        <Button variant="primary" onClick={handleShowAppointmentModal} className="mb-3">
                          Create Appointment
                        </Button>
                        {/* Button to open Add Patient modal */}
                        <Button variant="secondary" onClick={handleShowPatientModal} className="mb-3 ml-3">
                          Add Patient
                        </Button>
                      </Container>
                      <MedSecOngoing
                        allAppointments={allappointments}
                        setAllAppointments={setallappointments}
                        selectedDoctor={selectedDoctor}
                      />
                      </>
                    )}
                    {activeTab === "forpayment" && (
                      <>
                        <Container className='m-0 p-0 d-flex justify-content-end'>
                          
                        <Button variant="primary" onClick={handleShowAppointmentModal} className="mb-3">
                          Create Appointment
                        </Button>
                        {/* Button to open Add Patient modal */}
                        <Button variant="secondary" onClick={handleShowPatientModal} className="mb-3 ml-3">
                          Add Patient
                        </Button>
                      </Container>
                      <MedSecForPayment
                        allAppointments={allappointments}
                        setAllAppointments={setallappointments}
                        selectedDoctor={selectedDoctor}
                      />
                      </>
                    )}
                    {activeTab === "tosend" && (
                      <>
                        <Container className='m-0 p-0 d-flex justify-content-end'>
                          
                        <Button variant="primary" onClick={handleShowAppointmentModal} className="mb-3">
                          Create Appointment
                        </Button>
                        {/* Button to open Add Patient modal */}
                        <Button variant="secondary" onClick={handleShowPatientModal} className="mb-3 ml-3">
                          Add Patient
                        </Button>
                      </Container>
                      <MedSecToSend

                        allAppointments={allappointments}
                        setAllAppointments={setallappointments}
                        selectedDoctor={selectedDoctor}
                      />
                      </>
                    )}

                      {activeTab === "laboratory" && (
                      <>
                        <MedSecLaboratoryApp
                          allAppointments={allappointments}
                          setAllAppointments={setallappointments}
                          selectedDoctor={selectedDoctor}
                        />
                      </>
                    )}  
                    
                  </Container>
           
            </Container>

          </div>
        </div>
        
        {/* Modal for creating a patient */}
        <Modal show={showPatientModal} onHide={handleClosePatientModal} size="lg" centered>
          <Modal.Header className='w-100' closeButton>
            <Modal.Title className='w-100'>Create New Patient</Modal.Title>
          </Modal.Header>
          <Modal.Body className='w-100'>
            <CreatePatientForms onClose={handleClosePatientModal} />
          </Modal.Body>
        </Modal>

        {/* Modal for creating an appointment */}
        <Modal show={showAppointmentModal} onHide={handleCloseAppointmentModal} size="lg" centered>
          <Modal.Header className='w-100' closeButton>
            <Modal.Title>Create New Appointment</Modal.Title>
          </Modal.Header>
          <Modal.Body className='w-100'>
            <CreateAppointment onClose={handleCloseAppointmentModal} />
          </Modal.Body>
        </Modal>

      </Container>
    </>
  );
}

export default MedSecMain;
