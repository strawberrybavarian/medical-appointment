import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Nav, Button, Badge } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaUserCog } from 'react-icons/fa';
import AdminNavbar from '../../../navbar/AdminNavbar';
import SidebarAdmin from '../../../sidebar/SidebarAdmin';
import { ip } from '../../../../../../ContentExport';
import PatientHistory from '../../../../../patient/patientinformation/Patient History/PatientHistory';
import Prescription from '../../../../../patient/patientinformation/Prescription/Prescription';
import Immunization from '../../../../../patient/patientinformation/Immunization/Immunization';
import PatientLaboratory from '../../../../../patient/patientinformation/Laboratory/PatientLaboratory';
import AuditPatient from '../../../../../patient/patientinformation/Audit/AuditPatient';
import PatientEditModal from './PatientEditModal';

function PatientDetailsInformation() {
  const location = useLocation();
  const { patientId, userId, userName, role } = location.state || {};

  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('findings');
  const [thePrescriptions, setPrescriptions] = useState([]);
  const [theHistory, setHistory] = useState([]);
  const [theImmunization, setImmunization] = useState([]);
  const [theLaboratory, setLaboratory] = useState([]);
  const [error, setError] = useState(null);
  
  // State for modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const handleSelect = (selectedKey) => {
    setActiveTab(selectedKey);
  };
  
  // Account status badge styling
  const getBadgeVariant = (status) => {
    switch (status) {
      case 'Registered': return 'success';
      case 'Unregistered': return 'warning';
      case 'Deactivated': return 'danger';
      case 'Archived': return 'dark';
      default: return 'secondary';
    }
  };
  
  // Handler for patient status update
  const handlePatientStatusUpdate = (patientId, newStatus) => {
    setPatient(prevPatient => ({
      ...prevPatient,
      accountStatus: newStatus
    }));
  };
  
  // Handle patient update from edit modal
  const handleUpdatePatient = (patientId, updatedData) => {
    setPatient(prevPatient => ({
      ...prevPatient,
      ...updatedData
    }));
  };

  useEffect(() => {
    if (patientId) {
      axios.get(`${ip.address}/api/patient/api/onepatient/${patientId}`)
        .then((response) => {
          setPatient(response.data.thePatient);
        })
        .catch((error) => {
          console.error('Error fetching patient details:', error);
        });
    }
  }, [patientId]);
  
  useEffect(() => {
    axios.get(`${ip.address}/api/patient/api/onepatient/${patientId}`)
        .then((res) => {
            if (res.data && res.data.thePatient && Array.isArray(res.data.thePatient.patient_appointments)) {
                setPrescriptions(res.data.thePatient.patient_appointments);
                setHistory(res.data.thePatient.patient_findings);
                setImmunization(res.data.thePatient.immunizations);
                setLaboratory(res.data.thePatient.laboratoryResults);
            } else {
                setPrescriptions([]);
                setHistory([]);
                setLaboratory([]);
            }
        })
        .catch((err) => {
            console.log(err);
            setError('Failed to fetch prescriptions');
            setPrescriptions([]);
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
                  <Card className="pi-container2 shadow-sm w-100" style={{border: 'none'}}>
                    <Card.Header className="card-header-modded d-flex justify-content-between align-items-center">
                      <h4 className="mb-0">Personal Information</h4>
                      <div>
                  <span className="me-2">Account Status:</span>
                  <Badge 
                    bg={getBadgeVariant(patient.accountStatus)} 
                    style={{ fontSize: '1rem', padding: '8px 12px' }}
                  >
                    {patient.accountStatus || 'Unknown'}
                  </Badge>
                </div>
                    </Card.Header>
                    <Card.Body>
                      <div className='d-flex align-items-center justify-content-between mb-4'> 
                        <div style={{marginRight: '10px'}} className="d-flex align-items-center">
                          <div className="patient-image-container me-3">
                            {patient.patient_image ? (
                              <img 
                                className="patient-profile-image" 
                                src={`${ip.address}/${patient.patient_image}`}
                                alt={`${patient.patient_firstName}'s profile`} 
                                style={{
                                  width: '100px', 
                                  height: '100px',
                                  objectFit: 'cover',
                                  borderRadius: '50%',
                                  border: '3px solid #f0f0f0',
                                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                }}
                              />
                            ) : (
                              <div 
                                className="default-profile-image"
                                style={{
                                  width: '100px', 
                                  height: '100px',
                                  borderRadius: '50%',
                                  backgroundColor: '#e9ecef',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '2rem',
                                  color: '#6c757d',
                                  border: '3px solid #f0f0f0'
                                }}
                              >
                                {patient.patient_firstName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="m-0 fw-bold">{patient.patient_firstName} {patient.patient_middleInitial} {patient.patient_lastName}</h4>
                            <p className="text-muted" style={{fontSize: '15px'}}>Patient</p>
                            <p className="mb-0" style={{fontSize: '14px'}}><strong>ID:</strong> {patient.patient_ID}</p>
                          </div>
                        </div>

                        <div>
                          {/* Buttons for patient details modal */}
                          <div className="d-flex gap-2">
                            <Button 
                              variant="outline-primary" 
                              onClick={() => setShowEditModal(true)}
                              className="d-flex align-items-center"
                            >
                              <FaEdit className="me-1" /> Edit Profile
                            </Button>
                 
                          </div>
                        </div>
                      </div>

                      <hr className="my-3" />

                      <Row className="mt-3">
                        <Col md={6}>
                          <p><strong>Email:</strong> <span className="text-muted">{patient.patient_email}</span></p>    
                        </Col>
                        <Col md={6}>
                          <p><strong>Gender:</strong> <span className="text-muted">{patient.patient_gender}</span></p>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <p><strong>Phone:</strong> <span className="text-muted">{patient.patient_cnumber || patient.patient_contactNumber}</span></p>
                        </Col>
                        <Col md={6}>
                          <p><strong>Date of Birth:</strong> <span className="text-muted">{new Date(patient.patient_dob).toLocaleDateString()}</span></p>
                        </Col>
                      </Row>   
                      <Row>
                        <Col md={6}>
                          <p><strong>Age:</strong> <span className="text-muted">{patient.patient_age}</span></p>
                        </Col>
                        <Col md={6}>
                          <p><strong>Civil Status:</strong> <span className="text-muted">{patient.patient_civilstatus || 'Not specified'}</span></p>
                        </Col>
                      </Row>

                      <h5 className="mt-4 mb-3">Address Information</h5>
                      {patient.patient_address ? (
                        <>
                          <Row>
                            <Col md={6}>
                              <p><strong>Street:</strong> <span className="text-muted">{patient.patient_address.street}</span></p>
                            </Col>
                            <Col md={6}>
                              <p><strong>Barangay:</strong> <span className="text-muted">{patient.patient_address.barangay}</span></p>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <p><strong>City:</strong> <span className="text-muted">{patient.patient_address.city}</span></p>
                            </Col>
                            <Col md={6}>
                              <p><strong>Province:</strong> <span className="text-muted">{patient.patient_address.province}</span></p>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <p><strong>Region:</strong> <span className="text-muted">{patient.patient_address.region}</span></p>
                            </Col>
                            <Col md={6}>
                              <p><strong>ZIP Code:</strong> <span className="text-muted">{patient.patient_address.zipCode}</span></p>
                            </Col>
                          </Row>
                        </>
                      ) : (
                        <p className="text-muted">No address information available</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          ) : (
            <div className="text-center p-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading patient details...</p>
            </div>
          )}

          <div className='pnb-component mt-4'>
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

            <Container className={`pnb-content ${activeTab === 'findings' ? 'findings-tab' : 'other-tabs'}`}>
              {activeTab === 'findings' && <PatientHistory patientHistory={theHistory} pid={patientId}/>}
              {activeTab === 'prescription' && <Prescription prescriptions={thePrescriptions} pid={patientId} />} 
              {activeTab === 'immunization' && <Immunization immunizations={theImmunization} pid={patientId}/>}
              {activeTab === 'laboratory' && <PatientLaboratory laboratoryResults={theLaboratory} pid={patientId}/>}
              {activeTab === 'Audit' && <AuditPatient pid={patientId}/>}
            </Container>
          </div>
          

          
          {/* Patient Edit Modal */}
          <PatientEditModal
            patient={patient}
            show={showEditModal}
            handleClose={() => setShowEditModal(false)}
            handleUpdate={handleUpdatePatient}
          />
        </Container>
      </Container>
    </div>
  );
}

export default PatientDetailsInformation;