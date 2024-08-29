import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams if you need to pass params
import { Table, Button, Container, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import AdminNavbar from '../../navbar/AdminNavbar'; // Adjust the import path as needed
import SidebarAdmin from '../../sidebar/SidebarAdmin'; // Adjust the import path as needed

function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { aid } = useParams(); // If you need to get params from the URL

  useEffect(() => {
    axios.get('http://localhost:8000/patient/api/allpatient')
      .then((result) => {
        setPatients(result.data.thePatient);

        
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleShowModal = (patient, action) => {
    setSelectedPatient(patient);
    setModalAction(action);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPatient(null);
  };

  const handleAction = () => {
    const status = modalAction === 'register' ? 'Registered' : 'Deactivated';
    axios.put(`http://localhost:8000/admin/patient/account-status/${selectedPatient._id}`, { status })
      .then(() => {
        setPatients(patients.map(pat => pat._id === selectedPatient._id ? { ...pat, accountStatus: status } : pat));
        handleCloseModal();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.patient_firstName} ${patient.patient_middleInitial} ${patient.patient_lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='d-flex justify-content-center'>
      <SidebarAdmin aid={aid} /> {/* Sidebar integration */}
      
      <div style={{ width: '100%' }}>
        <AdminNavbar /> {/* Navbar integration */}
        
        <Container className='ad-container' style={{ height: 'calc(100vh - 56px)', overflowY: 'auto', padding: '20px' }}>
          <h1>Patient Management</h1>
          <Form.Group controlId="formPatientSearch">
            <Form.Control
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
          <Table striped bordered hover variant="light" className="mt-3">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Email</th>
                <th>Gender</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient._id}>
                  <td>{`${patient.patient_firstName} ${patient.patient_middleInitial}. ${patient.patient_lastName}`}</td>
                  <td>{patient.patient_email}</td>
                  <td>{patient.patient_gender}</td>
                  <td>{patient.accountStatus}</td>
                  <td>
                    <Button variant="primary" onClick={() => handleShowModal(patient, 'register')} disabled={patient.accountStatus === 'Registered'}>
                      Register
                    </Button>{' '}
                    <Button variant="danger" onClick={() => handleShowModal(patient, 'deactivate')} disabled={patient.accountStatus === 'Deactivated'}>
                      Deactivate
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Action</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to {modalAction} the patient "{selectedPatient?.patient_firstName} {selectedPatient?.patient_lastName}"?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant={modalAction === 'register' ? 'primary' : 'danger'} onClick={handleAction}>
                {modalAction === 'register' ? 'Register' : 'Deactivate'}
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </div>
  );
}

export default PatientManagement;
