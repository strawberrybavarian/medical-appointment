import React, { useState, useEffect } from 'react';
import { Button, Container, Modal, Dropdown } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import AdminNavbar from '../../navbar/AdminNavbar';
import SidebarAdmin from '../../sidebar/SidebarAdmin';
import DataTable from 'react-data-table-component';
import { ip } from '../../../../../ContentExport';
import { ThreeDots } from 'react-bootstrap-icons';
import PatientDetailsModal from './patientmodal/PatientDetailsModal';
import PatientEditModal from './patientmodal/PatientEditModal';
function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(null); // For PatientDetailsModal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const location = useLocation();
  const { userId, userName, role } = location.state || {};

  useEffect(() => {
    axios.get(`${ip.address}/api/patient/api/allpatient`)
      .then((result) => {
        setPatients(result.data.thePatient);
      })
      .catch((error) => {
        console.error('Error fetching patients:', error);
      });
  }, []);

  const handleShowActionModal = (patient, action) => {
    setSelectedPatient(patient);
    setModalAction(action);
    setShowActionModal(true);
  };

  const handleCloseActionModal = () => {
    setShowActionModal(false);
    setSelectedPatient(null);
  };

  const handleAction = () => {
    let status;
    if (modalAction === 'register') status = 'Registered';
    else if (modalAction === 'deactivate') status = 'Deactivated';
    else if (modalAction === 'unregister') status = 'Unregistered';
    else if (modalAction === 'archive') status = 'Archived';

    axios.put(`${ip.address}/api/admin/patient/account-status/${selectedPatient._id}`, { status })
      .then(() => {
        setPatients(patients.map(pat =>
          pat._id === selectedPatient._id ? { ...pat, accountStatus: status } : pat
        ));
        handleCloseActionModal();
      })
      .catch((error) => {
        console.error('Error updating account status:', error);
      });
  };

  // View patient details
  const handleViewDetails = (patient) => {
    setSelectedPatientId(patient._id);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPatientId(null);
  };

  // Edit patient details
  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedPatient(null);
  };

  const handleUpdatePatient = (patientId, updatedData) => {
    setPatients(patients.map(pat =>
      pat._id === patientId ? { ...pat, ...updatedData } : pat
    ));
  };

  const columns = [
    { name: 'First Name', selector: row => row.patient_firstName, sortable: true },
    { name: 'Middle Initial', selector: row => row.patient_middleInitial || '', sortable: true },
    { name: 'Last Name', selector: row => row.patient_lastName, sortable: true },
    { name: 'Email', selector: row => row.patient_email || 'No Email', sortable: true },
    { name: 'Gender', selector: row => row.patient_gender, sortable: true },
    { name: 'Account Status', selector: row => row.accountStatus, sortable: true, className: 'mode' },
    {
      name: 'Actions',
      cell: (row) => (
        <Dropdown>
          <Dropdown.Toggle variant="link" className="p-0">
            <ThreeDots size={24} />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleViewDetails(row)}>
              View Details
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleEditPatient(row)}>
              Edit
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => handleShowActionModal(row, 'register')}
              disabled={row.accountStatus === 'Registered'}
            >
              Register
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => handleShowActionModal(row, 'unregister')}
              disabled={row.accountStatus === 'Unregistered'}
            >
              Unregister
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => handleShowActionModal(row, 'deactivate')}
              disabled={row.accountStatus === 'Deactivated'}
            >
              Deactivate
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => handleShowActionModal(row, 'archive')}
              disabled={row.accountStatus === 'Archived'}
            >
              Archive
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className='d-flex justify-content-center'>
      <SidebarAdmin userId={userId} userName={userName} role={role} />
      <div style={{ width: '100%' }}>
        <AdminNavbar userId={userId} userName={userName} role={role} />
        <Container className='ad-container' style={{ height: 'calc(100vh - 56px)', overflowY: 'auto', padding: '20px' }}>
          <h1>Patient Management</h1>

          <DataTable
            columns={columns}
            data={patients}
            pagination
            highlightOnHover
            striped
            responsive
            noDataComponent="No patients available"
          />

          {/* Action Modal */}
          <Modal show={showActionModal} onHide={handleCloseActionModal}>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Action</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to {modalAction} the patient "{selectedPatient?.patient_firstName} {selectedPatient?.patient_lastName}"?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseActionModal}>
                Cancel
              </Button>
              <Button
                variant={
                  modalAction === 'register' ? 'primary' :
                  modalAction === 'deactivate' ? 'danger' :
                  modalAction === 'unregister' ? 'warning' :
                  modalAction === 'archive' ? 'dark' : 'secondary'
                }
                onClick={handleAction}
              >
                {modalAction.charAt(0).toUpperCase() + modalAction.slice(1)}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* View Details Modal */}
          <PatientDetailsModal
            patientId={selectedPatientId}
            show={showDetailsModal}
            handleClose={handleCloseDetailsModal}
          />

          {/* Edit Patient Modal */}
          <PatientEditModal
            patient={selectedPatient}
            show={showEditModal}
            handleClose={handleCloseEditModal}
            handleUpdate={handleUpdatePatient}
          />

        </Container>
      </div>
    </div>
  );
}

export default PatientManagement;
