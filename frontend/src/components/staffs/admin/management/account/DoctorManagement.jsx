import React, { useState, useEffect } from 'react';
import { Button, Container, Modal, Form, Table, Pagination } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';
import AdminNavbar from '../../navbar/AdminNavbar';
import SidebarAdmin from '../../sidebar/SidebarAdmin';
import { ThreeDots } from 'react-bootstrap-icons';
import AddDoctorModal from './patientmodal/AddDoctorModal';
import Select from 'react-select'; // Import react-select
import ManageDoctorMain from '../../../medical secretary/components/Manage Doctors/ManageDoctorMain';
import UpdateInfoModal from '../../../../practitioner/accountinfo/modal/UpdateInfoModal';
import EditDoctorDetails from './patientmodal/EditDoctorDetails';
function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // For confirming "Register" or "Deactivate"
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalAction, setModalAction] = useState("");

  // For Manage Doctor Schedule
  const [showManageDoctorModal, setShowManageDoctorModal] = useState(false);

  // For adding a new doctor
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

  // For updating doctor info
  const [showUpdateDoctorModal, setShowUpdateDoctorModal] = useState(false);

  // Searching and Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);

  // Pull info from location (optional)
  const location = useLocation();
  const { userId, userName, role } = location.state || {};

  // For navigation
  const navigate = useNavigate();
  const handleViewDoctorDetails = (doctor) => {
    navigate('/admin/account/doctor/personal-details', {
      state: { doctorId: doctor._id, userId, userName, role },
    });
  };

  // Fetch all doctors on mount
  useEffect(() => {
    axios
      .get(`${ip.address}/api/doctor/api/alldoctor`)
      .then((result) => {
        setDoctors(result.data.theDoctor);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // Show "Add Doctor" modal
  const handleShowAddDoctorModal = () => setShowAddDoctorModal(true);
  const handleCloseAddDoctorModal = () => setShowAddDoctorModal(false);

  /**
   * Triggered when user selects an option from the dropdown
   * e.g., "Manage Schedule", "Personal Details", "Register", "Deactivate", "Update"
   */
  const handleShowModal = (doctor, action) => {
    setSelectedDoctor(doctor);
    setModalAction(action);

    if (action === 'manage') {
      // Show ManageDoctorMain
      setShowManageDoctorModal(true);
    } else if (action === 'details') {
      // Navigate to personal details
      handleViewDoctorDetails(doctor);
    } else if (action === 'update') {
      // Show the "UpdateInfoModal"
      handleUpdateDoctorModal(doctor);
    } else {
      // For "register" or "deactivate" => show confirmation
      setShowActionModal(true);
    }
  };

  // Show the UpdateInfoModal
  const handleUpdateDoctorModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowUpdateDoctorModal(true);
  };

  // Close the "Register/Deactivate" modal
  const handleCloseActionModal = () => setShowActionModal(false);

  // Close Manage Schedule modal
  const handleCloseManageDoctorModal = () => setShowManageDoctorModal(false);

  // Confirm "Register" or "Deactivate"
  const handleAction = () => {
    const status = modalAction === 'register' ? 'Registered' : 'Deactivated';
    axios
      .put(`${ip.address}/api/admin/api/doctor/account-status/${selectedDoctor._id}`, { status })
      .then(() => {
        setDoctors((prev) =>
          prev.map((doc) =>
            doc._id === selectedDoctor._id ? { ...doc, accountStatus: status } : doc
          )
        );
        handleCloseActionModal();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // For final form submission from "UpdateInfoModal"
  const handleUpdate = (updatedData) => {
    // Example: you'd call an endpoint here to update
    // We'll assume there's an endpoint like: /api/doctor/api/{did}/updateDetails
    axios
      .put(`${ip.address}/api/doctor/api/${selectedDoctor?._id}/updateDetails`, updatedData)
      .then((response) => {
        const { updatedDoctor } = response.data;

        // Update the local state with the new info
        setDoctors((prev) =>
          prev.map((doc) => (doc._id === updatedDoctor._id ? updatedDoctor : doc))
        );

        setShowUpdateDoctorModal(false);
      })
      .catch((error) => {
        console.error('Error updating doctor info:', error);
      });
  };

  // Search filter
  const filteredDoctors = doctors.filter((doctor) =>
    `${doctor.dr_firstName} ${doctor.dr_middleInitial} ${doctor.dr_lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredDoctors.slice(indexOfFirstEntry, indexOfLastEntry);
  const pageNumbers = Array.from({ length: Math.ceil(filteredDoctors.length / entriesPerPage) }, (_, i) => i + 1);

  return (
    <div className="d-flex">
      <SidebarAdmin userId={userId} userName={userName} role={role} />
      <Container fluid className="cont-fluid-no-gutter" style={{ width: '100%', height: '100vh', overflowY: 'auto' }}>
        <AdminNavbar userId={userId} userName={userName} role={role} />
        <Container fluid className="ad-container p-5" style={{ overflowY: 'hidden' }}>
          <h1>Doctor Management</h1>

          <Button variant="primary" onClick={handleShowAddDoctorModal} className="mb-3">
            Add Doctor
          </Button>

          <Form.Group controlId="formDoctorSearch" className="mb-3">
            <Form.Label>Search Doctors:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>

          {/* Scrollable Table */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Table responsive striped variant="light">
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
                {currentEntries.map((row, index) => {
                  return (
                    <tr key={row._id}>
                      <td>{index + 1}</td>
                      <td>{`${row.dr_firstName} ${row.dr_middleInitial}. ${row.dr_lastName}`}</td>
                      <td>{row.dr_email || 'No Email'}</td>
                      <td>{row.dr_specialty}</td>
                      <td>{row.accountStatus}</td>
                      <td>
                        <Select
                          options={[
                            { label: 'Manage Schedule', value: 'manage' },
                            { label: 'Personal Details', value: 'details' },
                            { label: 'Register', value: 'register', isDisabled: row.accountStatus === 'Registered' },
                            { label: 'Deactivate', value: 'deactivate', isDisabled: row.accountStatus === 'Deactivated' },
                            { label: 'Update', value: 'update' },
                          ]}
                          onChange={(selectedOption) => handleShowModal(row, selectedOption.value)}
                          getOptionLabel={(e) => e.label}
                          getOptionValue={(e) => e.value}
                          className="react-select"
                          classNamePrefix="select"
                          isSearchable={false}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          <Pagination className="mt-3">
            <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
            {pageNumbers.map((number) => (
              <Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>
                {number}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageNumbers.length))}
              disabled={currentPage === pageNumbers.length}
            />
            <Pagination.Last
              onClick={() => setCurrentPage(pageNumbers.length)}
              disabled={currentPage === pageNumbers.length}
            />
          </Pagination>

          {/* Add Doctor Modal */}
          <AddDoctorModal show={showAddDoctorModal} handleClose={handleCloseAddDoctorModal} setDoctors={setDoctors} />

          {/* Action Confirmation Modal (Register/Deactivate) */}
          <Modal show={showActionModal} onHide={handleCloseActionModal}>
            <Modal.Header className="am-header" closeButton>
              <Modal.Title>Confirm Action</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ width: '100%' }}>
              Are you sure you want to {modalAction} the doctor "{selectedDoctor?.dr_firstName} {selectedDoctor?.dr_lastName}"?
            </Modal.Body>
            <Modal.Footer style={{ width: '100%' }}>
              <Button variant="secondary" onClick={handleCloseActionModal}>
                Cancel
              </Button>
              <Button variant={modalAction === 'register' ? 'primary' : 'danger'} onClick={handleAction}>
                {modalAction === 'register' ? 'Register' : 'Deactivate'}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Manage Doctor Modal */}
          <Modal dialogClassName="modal-90w" show={showManageDoctorModal} onHide={handleCloseManageDoctorModal} size="xl" backdrop="static">
            <Modal.Header style={{ width: '100%' }} closeButton>
              <Modal.Title>Manage Doctor</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0" style={{ width: '100%' }}>
              {selectedDoctor && <ManageDoctorMain did={selectedDoctor._id} showModal={true} />}
            </Modal.Body>
            <Modal.Footer style={{ width: '100%' }}>
              <Button variant="secondary" onClick={handleCloseManageDoctorModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Update Doctor Modal */}
          <EditDoctorDetails 
            show={showUpdateDoctorModal}
            handleClose={() => setShowUpdateDoctorModal(false)}
            doctorData={selectedDoctor}
            handleUpdate={handleUpdate}
          />
        </Container>
      </Container>
    </div>
  );
}

export default DoctorManagement;
