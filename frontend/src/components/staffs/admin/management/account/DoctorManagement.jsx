import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Table, Button, Container, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';
import AdminNavbar from '../../navbar/AdminNavbar';
import SidebarAdmin from '../../sidebar/SidebarAdmin';
function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { aid } = useParams();
  useEffect(() => {
    axios.get(`${ip.address}/doctor/api/alldoctor`)
      .then((result) => {
        setDoctors(result.data.theDoctor);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleShowModal = (doctor, action) => {
    setSelectedDoctor(doctor);
    setModalAction(action);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDoctor(null);
  };

  const handleAction = () => {
    const status = modalAction === 'register' ? 'Registered' : 'Deactivated';
    axios.put(`${ip.address}/admin/api/doctor/account-status/${selectedDoctor._id}`, { status })
      .then(() => {
        setDoctors(doctors.map(doc => doc._id === selectedDoctor._id ? { ...doc, accountStatus: status } : doc));
        handleCloseModal();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const filteredDoctors = doctors.filter(doctor =>
    `${doctor.dr_firstName} ${doctor.dr_middleInitial} ${doctor.dr_lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='d-flex'>
      <SidebarAdmin aid={aid} />
  
      <div style={{ width: '100%' }}>
      <AdminNavbar />

      <Container className='ad-container'  style={{ height: 'calc(100vh - 56px)', overflowY: 'auto', padding: '20px' }}>


      <h1>Doctor Management</h1>
      <Form.Group controlId="formDoctorSearch">
        <Form.Control
          type="text"
          placeholder="Search doctors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>
      <Table responsive striped  variant="light" className="mt-3">
        <thead>
          <tr>
            <th>#</th>
            <th>Doctor Name</th>
            <th>Email</th>
            <th>Specialty</th>
            <th>Account Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDoctors.map((doctor, index) => (
            <tr key={doctor._id}>
              <td>{index+1}.</td>
              <td>{`${doctor.dr_firstName} ${doctor.dr_middleInitial}. ${doctor.dr_lastName}`}</td>
              <td>{doctor.dr_email}</td>
              <td>{doctor.dr_specialty}</td>
              <td>{doctor.accountStatus}</td>
              <td>
                <div className='d-flex justify-content-around flex-wrap'>
                  <Link className='primary-color' onClick={() => handleShowModal(doctor, 'register')} disabled={doctor.accountStatus === 'Registered'}>
                    Register
                  </Link>{' '}
                  <Link className='danger-color' onClick={() => handleShowModal(doctor, 'deactivate')} disabled={doctor.accountStatus === 'Deactivated'}>
                    Deactivate
                  </Link>
                </div>
               
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
          Are you sure you want to {modalAction} the doctor "{selectedDoctor?.dr_firstName} {selectedDoctor?.dr_lastName}"?
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

export default DoctorManagement;
