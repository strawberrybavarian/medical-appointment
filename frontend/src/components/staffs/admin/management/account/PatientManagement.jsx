import React, { useState, useEffect } from 'react';
import { Button, Container, Modal, Dropdown, Form, Table, Pagination } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import AdminNavbar from '../../navbar/AdminNavbar';
import SidebarAdmin from '../../sidebar/SidebarAdmin';
import { ChatDotsFill, ThreeDots } from 'react-bootstrap-icons';

import PatientEditModal from './patientmodal/PatientEditModal';
import { ip } from '../../../../../ContentExport';
import PastAppointmentsModal from '../../../medical secretary/components/All Patient/PastAppointmentsModal';
import PatientDetailsInformation from './patientmodal/PatientDetailsInformation';
import { useNavigate } from "react-router-dom";
import ChatComponent from '../../../../chat/ChatComponent';

function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [showPastAppointmentsModal, setShowPastAppointmentsModal] = useState(false); // For PastAppointmentsModal
  const [showChat, setShowChat] = useState(false);
  const location = useLocation();
  const { userId, userName, role } = location.state || {};
  const navigate = useNavigate();
  const navigateWithState = (path) => {
    navigate(path, { state: { userId, userName, role } });
  };
  
  // Fetch patients data
  useEffect(() => {
    axios.get(`${ip.address}/api/patient/api/allpatient`)
      .then((result) => {
        setPatients(result.data.thePatient);
      })
      .catch((error) => {
        console.error('Error fetching patients:', error);
      });
  }, []);

  const handleViewPatientDetails = (patient) => {
    setSelectedPatientId(patient._id); // Set the patientId
    // Navigate to the PatientDetailsInformation page with patientId in state
    navigate("/admin/account/patient/personal-details", { state: { patientId: patient._id, userId, userName, role } });
  };

  // Handle modals and actions
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
    const statusMap = {
      register: 'Registered',
      deactivate: 'Deactivated',
      unregister: 'Unregistered',
      archive: 'Archived',
    };

    const status = statusMap[modalAction];

    axios.put(`${ip.address}/api/admin/patient/account-status/${selectedPatient._id}`, { status })
      .then(() => {
        setPatients((prevPatients) =>
          prevPatients.map((pat) =>
            pat._id === selectedPatient._id ? { ...pat, accountStatus: status } : pat
          )
        );
        handleCloseActionModal();
      })
      .catch((error) => {
        console.error('Error updating account status:', error);
      });
  };

  const handleViewDetails = (patient) => {
    setSelectedPatientId(patient._id);
    setShowDetailsModal(true);
  };


  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPatientId(null);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedPatient(null);
  };
  const handlePastAppointment = (patient) => {
    setSelectedPatientId(patient._id);
    setShowPastAppointmentsModal(true); // Show Past Appointments Modal
  };
  const handleClosePastAppointmentsModal = () => {
    setShowPastAppointmentsModal(false);
    setSelectedPatientId(null);
  };

  const handleUpdatePatient = (patientId, updatedData) => {
    setPatients((prevPatients) =>
      prevPatients.map((pat) =>
        pat._id === patientId ? { ...pat, ...updatedData } : pat
      )
    );
  };

  // Sorting
  const handleSort = (key) => {
    setSortConfig((prevSortConfig) => ({
      key,
      direction: prevSortConfig.key === key && prevSortConfig.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  const sortedPatients = [...patients].sort((a, b) => {
    if (!sortConfig.key) return 0;
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  // Filtering and Pagination
  const filteredPatients = sortedPatients.filter((pat) =>
    `${pat.patient_firstName} ${pat.patient_middleInitial || ''} ${pat.patient_lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredPatients.slice(indexOfFirstEntry, indexOfLastEntry);

  const pageNumbers = Array.from({ length: Math.ceil(filteredPatients.length / entriesPerPage) }, (_, i) => i + 1);

  return (
    <div className="d-flex justify-content-center">
      <SidebarAdmin userId={userId} userName={userName} role={role} />
      <Container fluid className="cont-fluid-no-gutter" style={{ width: '100%', height: '100vh', overflowY: 'auto' }}>
        <AdminNavbar userId={userId} userName={userName} role={role} />
        <Container className="ad-container" style={{ height: 'calc(100vh - 56px)', overflowY: 'auto', padding: '20px' }}>
          <h1>Patient Management</h1>
          <hr />

          {/* Search and Entries */}
          <Form className="mb-3 d-flex flex-row">
            <Form.Group style={{ marginRight: '10px' }}>
              <Form.Label>Search by Name:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Entries per page:</Form.Label>
              <Form.Control
                as="select"
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
              >
                {[5, 10, 15, 30, 50].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>

          {/* Table */}
          <Table responsive striped variant="light" className="mt-3">
            <thead>
              <tr>
                <th onClick={() => handleSort('patient_firstName')}>
                  Name {sortConfig.key === 'patient_firstName' &&  (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th>Email</th>
                <th>Gender</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.map((row) => {
                const fullName = `${row.patient_firstName} ${row.patient_middleInitial || ''} ${row.patient_lastName}`;
                return (
                <tr key={row._id}>
                  <td className="text-start">{fullName}</td>
       
                  <td>{row.patient_email || 'No Email'}</td>
                  <td>{row.patient_gender}</td>
                  <td>{row.accountStatus}</td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle variant="link" className="p-0">
                        <ThreeDots size={24} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleViewPatientDetails(row)}>Personal Details</Dropdown.Item>
                        <Dropdown.Item> </Dropdown.Item>
                        <Dropdown.Item onClick={() => handlePastAppointment('/admin/account/patient/personal-details')}>Past Appointments</Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => handleShowActionModal(row, 'register')}
                          disabled={row.accountStatus === 'Registered'}
                        >
                          Register
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleEditPatient(row)}>Edit Details</Dropdown.Item>

                        
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
                  </td>
                </tr>
              )})}
            </tbody>
          </Table>

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
            <Pagination.Last onClick={() => setCurrentPage(pageNumbers.length)} disabled={currentPage === pageNumbers.length} />
          </Pagination>

          
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

          {/* Modals */}
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

          {showDetailsModal && (
            <PatientDetailsInformation
              patientId={selectedPatientId}
              show={showDetailsModal}
              handleClose={handleCloseDetailsModal}
              userId={userId}
              userName={userName}
              role={role}
            />
          )}

          <PatientEditModal
            patient={selectedPatient}
            show={showEditModal}
            handleClose={handleCloseEditModal}
            handleUpdate={handleUpdatePatient}
          />


          <PastAppointmentsModal
            patientId={selectedPatientId}
            show={showPastAppointmentsModal}
            onClose={handleClosePastAppointmentsModal}
          />
        </Container>
      </Container>
    </div>
  );
}

export default PatientManagement;
