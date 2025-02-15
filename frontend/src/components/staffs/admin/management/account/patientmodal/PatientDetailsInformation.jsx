import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Nav } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import AdminNavbar from '../../../navbar/AdminNavbar';
import SidebarAdmin from '../../../sidebar/SidebarAdmin';
import { ip } from '../../../../../../ContentExport';
import PatientHistory from '../../../../../patient/patientinformation/Patient History/PatientHistory';
import Prescription from '../../../../../patient/patientinformation/Prescription/Prescription';
import Immunization from '../../../../../patient/patientinformation/Immunization/Immunization';
import PatientLaboratory from '../../../../../patient/patientinformation/Laboratory/PatientLaboratory';
import AuditPatient from '../../../../../patient/patientinformation/Audit/AuditPatient';
function PatientDetailsInformation() {
  const location = useLocation();
  const { patientId, userId, userName, role } = location.state || {};  // Access patientId via location.state

  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('findings');
    const [thePrescriptions, setPrescriptions] = useState([]);
      const [theHistory, setHistory] = useState([]);
      const [theImmunization, setImmunization] = useState([]);
      const [theLaboratory, setLaboratory] = useState([]);
          const [error, setError] = useState(null);
      
  console.log(patient)
console.log('log',patientId)

const handleSelect = (selectedKey) => {
  // Update the active tab based on the selected event key
  setActiveTab(selectedKey);
};

  useEffect(() => {
    if (patientId) {
      axios.get(`${ip.address}/api/patient/api/onepatient/${patientId}`)
        .then((response) => {
          setPatient(response.data.thePatient); // Set the patient data
        })
        .catch((error) => {
          console.error('Error fetching patient details:', error);
        });
    }
  }, [patientId]); // Re-fetch when patientId changes
  useEffect(() => {
    axios.get(`${ip.address}/api/patient/api/onepatient/${patientId}`)
        .then((res) => {
            console.log(res.data);  // Log the entire response to understand its structure
            if (res.data && res.data.thePatient && Array.isArray(res.data.thePatient.patient_appointments)) {
                setPrescriptions(res.data.thePatient.patient_appointments);
                setHistory(res.data.thePatient.patient_findings);
                setImmunization(res.data.thePatient.immunizations);
                setLaboratory(res.data.thePatient.laboratoryResults);

            } else {
                setPrescriptions([]);
                setHistory([]); 
                setLaboratory([]) // If data is not as expected, set to empty array
            }
        })
        .catch((err) => {
            console.log(err);
            setError('Failed to fetch prescriptions');
            setPrescriptions([]);  // In case of error, set to empty array
        });
}, [patientId]);
  return (
    <div className="d-flex justify-content-center">
      <SidebarAdmin userId={userId} userName={userName} role={role} />
      <Container fluid className="cont-fluid-no-gutter" style={{ width: '100%', height: '100vh', overflowY: 'auto', overflowX: 'hidden' }}>
      <AdminNavbar userId={userId} userName={userName} role={role} />
   
      
            <Container className="ad-container" style={{ height: 'calc(100vh)', overflowY: 'auto', padding: '20px' }}>
            {patient ? (
              <div>
              
                <Row className="">
                  <Col md={12} className="">
                    <Card className="pi-container2 shadow-sm  w-100" style={{border: 'none'}}>
                      <Card.Header className="card-header-modded"><h4>Personal Information</h4></Card.Header>
                      <Card.Body>
                        <div className=' d-flex align-items-center mb-3'> 
                          <img className="ai-image" src={`${ip.address}/${patient.patient_image}`}/>
                          <div style={{marginLeft: '1rem'}} className="d-flex align-items-center justify-content-between mt-3 w-100">
                            <div>
                              <h4 className="m-0">{patient.patient_firstName} {patient.patient_middleInitial} {patient.patient_lastName}</h4>
                              <p style={{fontSize: '15px'}}>Patient</p>
                            </div>
                          </div>

                          
                        </div>

                        <Row>

                          <Col>
                            <p><strong>Email:</strong> {patient.patient_email}</p>    
                          </Col>
                          <Col>
                            <p><strong>Gender:</strong> {patient.patient_gender}</p>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <p><strong>Phone:</strong> {patient.patient_contactNumber}</p>
                          </Col>
                          <Col>
                          <p><strong>Date of Birth:</strong> {new Date(patient.patient_dob).toLocaleDateString()}</p>
                          </Col>
                        </Row>   

                        <Row>
                          <Col>
                            <p><strong>Address:</strong> </p>
                          </Col>
          
                          
                        </Row>     

                         <Row>
                          <Col>
                            <p><strong>Street:</strong> {patient.patient_address.street}</p>
                          </Col>
                          <Col>
                            <p><strong>Barangay:</strong> {patient.patient_address.barangay}</p>
                          </Col>

                        </Row>

                        <Row>
                          <Col>
                            <p><strong>City:</strong> {patient.patient_address.city}</p>
                          </Col>
                        </Row>
                         
                      

                      
                        {/* <p><strong>Address:</strong> {patient.patient_address}</p> */}
                      </Card.Body>
                    </Card>

                  </Col>

                </Row>
              </div>
            ) : (
              <p>Loading patient details...</p> // Display while the data is being fetched
            )}


            <div className='pnb-component'>
                <Container className='d-flex p-0'>
                    <Nav fill variant="tabs" className='navtabs-pxmanagement' activeKey={activeTab} onSelect={handleSelect}>
                        <Nav.Item>
                            <Nav.Link eventKey="findings">Patient History</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="prescription">My Prescriptions</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="immunization">My Immunizations</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="laboratory">Laboratory Results</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="Audit">Audit</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Container>

                {/* Render components based on the active tab */}
                <Container className={`pnb-content ${activeTab === 'findings' ? 'findings-tab' : 'other-tabs'}`}>
                    {activeTab === 'findings' && <PatientHistory patientHistory={theHistory} pid={patientId}/>}
                    {activeTab === 'prescription' && <Prescription prescriptions={thePrescriptions} pid={patientId} />} 
                    {activeTab === 'immunization' && <Immunization immunizations={theImmunization} pid={patientId}/>}
                    {activeTab === 'laboratory' && <PatientLaboratory laboratoryResults={theLaboratory} pid={patientId}/>}
                    {activeTab === 'Audit' && <AuditPatient pid={patientId}/>}
                </Container>
            </div>
          </Container>
          
     

        

     
          
    



      </Container>
    </div>
  );
}

export default PatientDetailsInformation;

