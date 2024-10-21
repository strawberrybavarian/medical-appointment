import { useLocation } from 'react-router-dom';
import MedSecNavbar from '../../navbar/MedSecNavbar';
import MedSecTodaysApp from '../Appointments/MedSecTodaysApp';
import MedSecPending from '../Appointments/MedSecPending';
import MedSecOngoing from '../Appointments/MedSecOngoing';
import MedSecForPayment from '../Appointments/MedSecForPayment';
import MedSecLaboratoryApp from '../Appointments/MedSecLaboratoryApp';
import MedSecToSend from '../Appointments/MedSecToSend';
import CreatePatientForms from '../Add Patient/Forms/CreatePatientForms';
import CreateAppointment from '../Add Patient/New Appointment/CreateAppointment';
import { Container, Nav, Row, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ip } from '../../../../../ContentExport';

import './MedSecMain.css';
import CreateServiceForm from '../Services/CreateServiceForm';

function MedSecMain() {
  const location = useLocation();
  const { userId, userName, role } = location.state || {};

  const [allAppointments, setAllAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false); // Service Modal State

  // Fetch all appointments
  useEffect(() => {
    axios
      .get(`${ip.address}/api/medicalsecretary/api/allappointments`)
      .then((result) => setAllAppointments(result.data.Appointments))
      .catch((error) => console.error(error));
  }, []);

  const handleShowPatientModal = () => setShowPatientModal(true);
  const handleClosePatientModal = () => setShowPatientModal(false);

  const handleShowAppointmentModal = () => setShowAppointmentModal(true);
  const handleCloseAppointmentModal = () => setShowAppointmentModal(false);

  const handleShowServiceModal = () => setShowServiceModal(true); // Show Service Modal
  const handleCloseServiceModal = () => setShowServiceModal(false); // Close Service Modal

  // Handle active tab selection via query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);
  }, [location.search]);
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
                        allAppointments={allAppointments}
                        setAllAppointments={setAllAppointments}
                        selectedDoctor={selectedDoctor}
                      />
                      </>
                    
                    )}
                  {activeTab === "pending" && (
                  <>
                    <Container fluid className='w-100 d-flex justify-content-end'>
                      <Button variant="primary" onClick={handleShowAppointmentModal} className="mb-3">
                        Create Appointment
                      </Button>
                      <Button variant="secondary" onClick={handleShowPatientModal} className="mb-3 ml-3">
                        Add Patient
                      </Button>
                      <Button variant="success" onClick={handleShowServiceModal} className="mb-3 ml-3">
                        Create Service
                      </Button>
                    </Container>
                    <MedSecPending allAppointments={allAppointments}  setAllAppointments={setAllAppointments} selectedDoctor={selectedDoctor} />
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
                        allAppointments={allAppointments}
                        setAllAppointments={setAllAppointments}
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
                        allAppointments={allAppointments}
                        setAllAppointments={setAllAppointments}
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
                        msid={userId}
                        allAppointments={allAppointments}
                        setAllAppointments={setAllAppointments}
                        selectedDoctor={selectedDoctor}
                      />
                      </>
                    )}

                      {activeTab === "laboratory" && (
                      <>
                        <MedSecLaboratoryApp
                          allAppointments={allAppointments}
                          setAllAppointments={setAllAppointments}
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

        
         
         
          <CreateServiceForm 
              show={showServiceModal} // Pass show state correctly
              onClose={handleCloseServiceModal} // Pass close function
            />

            
         


      </Container>
    </>
  );
}

export default MedSecMain;
