import { useLocation } from 'react-router-dom';
import MedSecTodaysApp from '../../medical secretary/components/Appointments/MedSecTodaysApp';
import MedSecOngoing from '../../medical secretary/components/Appointments/MedSecOngoing';
import { Container, Nav, Row, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
// import './AdminAppointmentMain.css';
import { ip } from '../../../../ContentExport';
import MedSecToSend from '../../medical secretary/components/Appointments/MedSecToSend';
import MedSecLaboratoryApp from '../../medical secretary/components/Appointments/MedSecLaboratoryApp';
import CreateAppointment from '../../medical secretary/components/Add Patient/New Appointment/CreateAppointment';
import CreatePatientForms from '../../medical secretary/components/Add Patient/Forms/CreatePatientForms';
import MedSecForPayment from '../../medical secretary/components/Appointments/MedSecForPayment';
import MedSecCancelled from '../../medical secretary/components/Appointments/MedSecCancelled';
import SidebarAdmin from '../sidebar/SidebarAdmin';
import AdminNavbar from '../navbar/AdminNavbar';
import MedSecPending from '../../medical secretary/components/Appointments/MedSecPending';
import MedSecCompleted from '../../medical secretary/components/Appointments/MedSecCompleted';
import { ChatDotsFill } from 'react-bootstrap-icons';
import ChatComponent from '../../../chat/ChatComponent';
function AdminAppointmentMain() {
  const containerStyle = {
    display: 'flex',
    height: '100vh', // Full height of the viewport
    overflow: 'hidden', // Prevents scrolling issues for the main layout
  };



  const contentWrapperStyle = {
    width: '100%',
    height: '100vh',
    overflow: 'auto', // Enable scrolling inside the content area
    display: 'flex',
    flexDirection: 'column', // Navbar on top, content below
  };

  const location = useLocation(); 
  const { userId, userName, role } = location.state || {};

  const [allappointments, setallappointments] = useState([]);
  const [selectedDoctor] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [showPatientModal, setShowPatientModal] = useState(false); // Modal for Add Patient
  const [showAppointmentModal, setShowAppointmentModal] = useState(false); // Modal for Create Appointment
  const [showChat, setShowChat] = useState(false);
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
    <div style={containerStyle}>
      <div>
        <SidebarAdmin userId={userId} userName={userName} role={role} />
      </div>
        <div style={contentWrapperStyle}>
          <AdminNavbar userId={userId} userName={userName} role={role} />
          <div className='maincolor-container'>
          <div className='content-area'>
            <Container className="d-flex justify-content-center pt-5 ">
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
                  <Nav.Item>
                    <Nav.Link eventKey="completed">Completed</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="cancelled">Cancelled</Nav.Link>
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
                        msid={userId}
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


                    {activeTab === "completed" && (
                      <>
                        <MedSecCompleted
                          allAppointments={allappointments}
                          setAllAppointments={setallappointments}
                          selectedDoctor={selectedDoctor}
                        />
                      </>
                    )}  


                    
                  {activeTab === "cancelled" && (
                      <>
                        <MedSecCancelled
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
        </div>

    </div>
     
     
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


    </>
  );
}

export default AdminAppointmentMain;
