import React, { useState, useEffect } from 'react';
import { Container, Modal, Dropdown, Table, Form, Pagination, Button, Card, Badge, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { ChatDotsFill, ThreeDots, Search } from 'react-bootstrap-icons';
import { ip } from '../../../../../ContentExport';
import CreateServiceForm from '../Services/CreateServiceForm';
import CreateAppointment from '../Add Patient/New Appointment/CreateAppointment';
import { useLocation } from 'react-router-dom';
import MedSecNavbar from '../../navbar/MedSecNavbar';
import PastAppointmentsModal from './PastAppointmentsModal'; 
import ChatComponent from '../../../../chat/ChatComponent';

function MedSecAllPatient() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage, setPatientsPerPage] = useState(10);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const location = useLocation();
  const { userId, role } = location.state || {};
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    axios.get(`${ip.address}/api/patient/api/allpatient`)
      .then((result) => {
        setPatients(result.data.thePatient);
      })
      .catch((error) => {
        console.error('Error fetching patients:', error);
      });
  }, []);

  const handleShowAppointmentModal = (patient) => {
    setSelectedPatient(patient);
    setShowAppointmentModal(true);
  };

  const handleCloseAppointmentModal = () => {
    setShowAppointmentModal(false);
    setSelectedPatient(null);
  };

  const handleShowServiceModal = (patient) => {
    setSelectedPatient(patient);
    setShowServiceModal(true);
  };

  const handleCloseServiceModal = () => {
    setShowServiceModal(false);
    setSelectedPatient(null);
  };

  // Get badge variant based on account status
  const getBadgeVariant = (status) => {
    switch (status) {
      case 'Registered': return 'success';
      case 'Unregistered': return 'warning';
      case 'Deactivated': return 'danger';
      case 'Archived': return 'dark';
      default: return 'secondary';
    }
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.patient_firstName} ${patient.patient_middleInitial || ''} ${patient.patient_lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // Paginate patients
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Pagination handler
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPatient(null);
  };

  return (
    <Container fluid className="p-0" style={{ height: '100vh', overflowY: 'auto' }}>
      <MedSecNavbar msid={userId} />
      
      <Container className="py-4">
        {/* Search and Filters Card */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>All Patients</h2>
            </div>
            
            {/* Search and Entries */}
            <div className="d-flex flex-wrap justify-content-between align-items-end">
              <Form.Group className="patient-search-form">
                <Form.Label>Search by Name:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter patient name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="shadow-sm"
                />
              </Form.Group>
              <Form.Group className="patient-entries-form">
                <Form.Label>Entries per page:</Form.Label>
                <Form.Select
                  value={patientsPerPage}
                  onChange={(e) => setPatientsPerPage(parseInt(e.target.value))}
                  className="shadow-sm"
                >
                  {[5, 10, 15, 30, 50].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </Card.Body>
        </Card>

        {/* Table Card */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.map((patient) => (
                  <tr key={patient._id} className="align-middle">
                    <td className="py-3 px-4">
                      <div className="d-flex align-items-center">
                        {patient.patient_image ? (
                          <img
                            src={`${ip.address}/${patient.patient_image}`}
                            alt={patient.patient_firstName}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              marginRight: '10px',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: '#e9ecef',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '10px',
                              fontSize: '16px',
                              fontWeight: '500',
                              color: '#6c757d'
                            }}
                          >
                            {patient.patient_firstName.charAt(0)}
                          </div>
                        )}
                        <span className="ms-2 fw-medium">
                          {patient.patient_firstName} {patient.patient_middleInitial || ''} {patient.patient_lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{patient.patient_email || 'No Email'}</td>
                    <td className="py-3 px-4">{patient.patient_gender}</td>
                    <td className="py-3 px-4">
                      <Badge bg={getBadgeVariant(patient.accountStatus)} pill className="status-badge">
                        {patient.accountStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Dropdown align="end">
                        <Dropdown.Toggle variant="light" className="btn-sm rounded-pill border" id={`dropdown-${patient._id}`}>
                          Actions <ThreeDots size={14} className="ms-1" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="shadow-sm">
                          <Dropdown.Item onClick={() => handleViewDetails(patient)}>
                            View Past Appointments
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleShowAppointmentModal(patient)}>
                            Create Doctor Appointment
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleShowServiceModal(patient)}>
                            Create Service Appointment
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}

                {currentPatients.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No patients found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
          
          {/* Pagination */}
          <Card.Footer className="bg-white border-top-0 d-flex justify-content-center">
            <Pagination className="mb-0">
              <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
              <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
              
              {pageNumbers.map((number) => (
                <Pagination.Item
                  key={number}
                  active={number === currentPage}
                  onClick={() => handlePageChange(number)}
                >
                  {number}
                </Pagination.Item>
              ))}
              
              <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
              <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
          </Card.Footer>
        </Card>
      </Container>

      {/* Create Appointment Modal */}
      <Modal show={showAppointmentModal} onHide={handleCloseAppointmentModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Doctor Appointment for {selectedPatient?.patient_firstName} {selectedPatient?.patient_lastName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateAppointment
            onClose={handleCloseAppointmentModal}
            patientId={selectedPatient?._id}
            patientName={`${selectedPatient?.patient_firstName} ${selectedPatient?.patient_middleInitial || ''} ${selectedPatient?.patient_lastName}`}
          />
        </Modal.Body>
      </Modal>

      {/* Create Service Modal */}
      <CreateServiceForm
        show={showServiceModal}
        onClose={handleCloseServiceModal}
        patientId={selectedPatient?._id}
        patientName={`${selectedPatient?.patient_firstName} ${selectedPatient?.patient_middleInitial || ''} ${selectedPatient?.patient_lastName}`}
      />

      {/* View Past Appointments Modal */}
      <PastAppointmentsModal
        patientId={selectedPatient?._id}
        show={showDetailsModal}
        onClose={handleCloseDetailsModal}
      />

      {/* Chat Button */}
      <div className="chat-btn-container">
        <Button
          className="chat-toggle-btn"
          onClick={() => setShowChat(!showChat)}
        >
          <ChatDotsFill size={30} />
        </Button>
      </div>

      {/* Chat Overlay */}
      {showChat && (
        <div className="chat-overlay">
          <ChatComponent
            userId={userId}
            userRole={role}
            closeChat={() => setShowChat(false)}
          />
        </div>
      )}
    </Container>
  );
}

export default MedSecAllPatient;