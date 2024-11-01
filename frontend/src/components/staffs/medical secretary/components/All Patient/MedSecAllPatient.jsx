import React, { useState, useEffect } from 'react';
import { Container, Modal, Dropdown, Table, Form, Pagination } from 'react-bootstrap';
import axios from 'axios';
import { ThreeDots } from 'react-bootstrap-icons';
import { ip } from '../../../../../ContentExport';
import CreateServiceForm from '../Services/CreateServiceForm';
import CreateAppointment from '../Add Patient/New Appointment/CreateAppointment';
import { useLocation } from 'react-router-dom';
import MedSecNavbar from '../../navbar/MedSecNavbar';

function MedSecAllPatient() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 10; // Adjust the number of patients displayed per page

  const location = useLocation();
  const { userId } = location.state || {};

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

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPatient(null);
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

  // Pagination handler
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container className="cont-fluid-no-gutter" fluid style={{ overflowY: 'scroll', height: '100vh'}}>
      <MedSecNavbar msid={userId} />

        <div className="maincolor-container">
          {/* Main Content Area */}
            <div className="content-area p-0 m-0">
                <Container>
                <h1>All Patients</h1>
      <Form.Group controlId="search" className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Email</th>
            <th>Gender</th>
            <th>Account Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPatients.map((patient) => (
            <tr key={patient._id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={`${ip.address}/${patient.patient_image}`}
                    alt="Patient"
                    style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                  />
                  {patient.patient_firstName} {patient.patient_middleInitial || ''} {patient.patient_lastName}
                </div>
              </td>
              <td>{patient.patient_email || 'No Email'}</td>
              <td>{patient.patient_gender}</td>
              <td>{patient.accountStatus}</td>
              <td>
                <Dropdown>
                  <Dropdown.Toggle variant="link" className="p-0">
                    <ThreeDots size={24} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
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
        </tbody>
      </Table>

      {/* Pagination Component */}
      <Pagination className="justify-content-center">
        <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            key={index + 1}
            active={index + 1 === currentPage}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
        <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
      </Pagination>
                </Container>
            </div>
        </div>
      

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
      {/* <PatientDetailsModal
        patientId={selectedPatient?._id}
        show={showDetailsModal}
        handleClose={handleCloseDetailsModal}
      /> */}
    </Container>
  );
}

export default MedSecAllPatient;
