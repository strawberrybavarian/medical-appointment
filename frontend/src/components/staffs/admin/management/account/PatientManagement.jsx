import React, { useState, useEffect } from 'react';
import { Button, Container, Modal, Form, Table, Pagination, Badge, Card } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import AdminNavbar from '../../navbar/AdminNavbar';
import SidebarAdmin from '../../sidebar/SidebarAdmin';
import { ChatDotsFill, Eye, PencilSquare, Calendar, PersonCheck, PersonX, Archive, PersonDash } from 'react-bootstrap-icons';

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
  const [showPastAppointmentsModal, setShowPastAppointmentsModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const location = useLocation();
  const { userId, userName, role } = location.state || {};
  const navigate = useNavigate();
  
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
    setSelectedPatientId(patient._id);
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
    setShowPastAppointmentsModal(true);
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

  return (
    <div className="d-flex justify-content-center">
      <SidebarAdmin userId={userId} userName={userName} role={role} />
      <Container fluid className="cont-fluid-no-gutter patient-container-fluid">
        <AdminNavbar userId={userId} userName={userName} role={role} />
        <Container className="ad-container patient-admin-container">
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h2 className="mb-4">Patient Management</h2>
              
              {/* Search and Entries */}
              <div className="d-flex flex-wrap justify-content-between align-items-end mb-4">
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
                    value={entriesPerPage}
                    onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
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

          {/* Table */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th 
                      onClick={() => handleSort('patient_firstName')} 
                      className="py-3 sortable-header"
                    >
                      Name {sortConfig.key === 'patient_firstName' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                    </th>
                    <th className="py-3">Email</th>
                    <th className="py-3">Gender</th>
                    <th className="py-3">Account Status</th>
                    <th className="py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.map((row) => {
                    const fullName = `${row.patient_firstName} ${row.patient_middleInitial || ''} ${row.patient_lastName}`;
                    return (
                    <tr key={row._id} className="align-middle">
                      <td className="py-3">{fullName}</td>
                      <td>{row.patient_email || 'No Email'}</td>
                      <td>{row.patient_gender}</td>
                      <td>
                        <Badge bg={getBadgeVariant(row.accountStatus)} pill className="status-badge">
                          {row.accountStatus}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            title="View Details"
                            onClick={() => handleViewPatientDetails(row)}
                          >
                            <Eye />
                          </Button>
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            title="Edit Patient"
                            onClick={() => handleEditPatient(row)}
                          >
                            <PencilSquare />
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            title="Past Appointments"
                            onClick={() => handlePastAppointment(row)}
                          >
                            <Calendar />
                          </Button>
                          
                        </div>
                      </td>
                    </tr>
                  )})}
                  
                  {currentEntries.length === 0 && (
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
                <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
                
                {pageNumbers.map((number) => (
                  <Pagination.Item 
                    key={number} 
                    active={number === currentPage} 
                    onClick={() => setCurrentPage(number)}
                  >
                    {number}
                  </Pagination.Item>
                ))}
                
                <Pagination.Next
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageNumbers.length))}
                  disabled={currentPage === pageNumbers.length || pageNumbers.length === 0}
                />
                <Pagination.Last 
                  onClick={() => setCurrentPage(pageNumbers.length)} 
                  disabled={currentPage === pageNumbers.length || pageNumbers.length === 0}
                />
              </Pagination>
            </Card.Footer>
          </Card>
          
          {/* Chat Button */}
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
              <ChatComponent
                userId={userId}
                userRole={role}
                closeChat={() => setShowChat(false)}
              />
            </div>
          )}

          {/* Action Confirmation Modal */}
          <Modal show={showActionModal} onHide={handleCloseActionModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Action</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to <strong>{modalAction}</strong> the patient "<strong>{selectedPatient?.patient_firstName} {selectedPatient?.patient_lastName}</strong>"?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseActionModal}>
                Cancel
              </Button>
              <Button
                variant={
                  modalAction === 'register' ? 'success' :
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