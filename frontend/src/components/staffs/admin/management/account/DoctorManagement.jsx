import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Container, Modal, Form, Dropdown } from 'react-bootstrap';
import { ThreeDots } from 'react-bootstrap-icons';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';
import AdminNavbar from '../../navbar/AdminNavbar';
import SidebarAdmin from '../../sidebar/SidebarAdmin';
import DataTable from 'react-data-table-component';
import AddDoctorModal from './patientmodal/AddDoctorModal';
function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false); // State for Add Doctor Modal
  const location = useLocation();
  const { userId, userName, role } = location.state || {};
  const handleShowAddDoctorModal = () => setShowAddDoctorModal(true);
  const handleCloseAddDoctorModal = () => setShowAddDoctorModal(false);
  useEffect(() => {
    axios.get(`${ip.address}/api/doctor/api/alldoctor`)
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
    axios.put(`${ip.address}/api/admin/api/doctor/account-status/${selectedDoctor._id}`, { status })
      .then(() => {
        setDoctors(doctors.map(doc => 
          doc._id === selectedDoctor._id ? { ...doc, accountStatus: status } : doc
        ));
        handleCloseModal();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const filteredDoctors = doctors.filter(doctor =>
    `${doctor.dr_firstName} ${doctor.dr_middleInitial} ${doctor.dr_lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const columns = [
    { name: '#', selector: (row, index) => index + 1, width: '50px' },
    { 
      name: 'Doctor Name', 
      selector: row => `${row.dr_firstName} ${row.dr_middleInitial}. ${row.dr_lastName}`, 
      sortable: true 
    },
    { name: 'Email', selector: row => row.dr_email || 'No Email', sortable: true },
    { name: 'Specialty', selector: row => row.dr_specialty, sortable: true },
    { name: 'Account Status', selector: row => row.accountStatus, sortable: true },
    {
      name: 'Actions',
      cell: (row) => (
        <Dropdown>
          <Dropdown.Toggle variant="link" className="p-0 ">
            <ThreeDots size={24} />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => handleShowModal(row, 'register')}
              disabled={row.accountStatus === 'Registered'}
            >
              Register
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => handleShowModal(row, 'deactivate')}
              disabled={row.accountStatus === 'Deactivated'}
            >
              Deactivate
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="d-flex">
      <SidebarAdmin userId={userId} userName={userName} role={role} />
      <Container className='cont-fluid-no-gutter'fluid style={{ width: '100%', height: '100vh', overflowY: 'auto' }}>
        <AdminNavbar userId={userId} userName={userName} role={role} />
        <Container fluid className="ad-container p-5" style={{  overflowY: 'hidden' }}>
          <h1>Doctor Management</h1>

          <Button variant="primary" onClick={handleShowAddDoctorModal} className="mb-3">
            Add Doctor
          </Button>
          <Form.Group controlId="formDoctorSearch">
            <Form.Control
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>

          <DataTable
            columns={columns}
            data={filteredDoctors}
            pagination
            highlightOnHover
            striped
            responsive
          />
            <AddDoctorModal
            show={showAddDoctorModal}
            handleClose={handleCloseAddDoctorModal}
            setDoctors={setDoctors} // Pass setDoctors to update the list after adding a new doctor
          />
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
              <Button 
                variant={modalAction === 'register' ? 'primary' : 'danger'} 
                onClick={handleAction}
              >
                {modalAction === 'register' ? 'Register' : 'Deactivate'}
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </Container>
    </div>
  );
}

export default DoctorManagement;
