import React, { useState, useEffect } from 'react';
import { Button, Container, Modal, Form, Table, Pagination, Badge, Card, Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';
import AdminNavbar from '../../navbar/AdminNavbar';
import SidebarAdmin from '../../sidebar/SidebarAdmin';
import { ChatDotsFill, Eye, Plus } from 'react-bootstrap-icons';
import AddDoctorModal from './patientmodal/AddDoctorModal';
import ManageDoctorMain from '../../../medical secretary/components/Manage Doctors/ManageDoctorMain';
import EditDoctorDetails from './patientmodal/EditDoctorDetails';
import ChatComponent from '../../../../chat/ChatComponent';

function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showChat, setShowChat] = useState(false);

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
  const [entriesPerPage, setEntriesPerPage] = useState(10);

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
        console.error('Error fetching doctors:', error);
      });
  }, []);

  // Show "Add Doctor" modal
  const handleShowAddDoctorModal = () => setShowAddDoctorModal(true);
  const handleCloseAddDoctorModal = () => setShowAddDoctorModal(false);

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
        console.error('Error updating account status:', error);
      });
  };

  // For final form submission from "UpdateInfoModal"
  const handleUpdate = (updatedData) => {
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

  // Search filter
  const filteredDoctors = doctors.filter((doctor) =>
    `${doctor.dr_firstName} ${doctor.dr_middleInitial || ''} ${doctor.dr_lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredDoctors.slice(indexOfFirstEntry, indexOfLastEntry);
  const pageNumbers = Array.from({ length: Math.ceil(filteredDoctors.length / entriesPerPage) }, (_, i) => i + 1);

  return (
    <div className="d-flex justify-content-center">
      <SidebarAdmin userId={userId} userName={userName} role={role} />
      <Container fluid className="cont-fluid-no-gutter" style={{ width: '100%', height: '100vh', overflowY: 'auto' }}>
        <AdminNavbar userId={userId} userName={userName} role={role} />
        <Container className="ad-container" style={{ height: 'calc(100vh - 56px)', overflowY: 'auto', padding: '20px' }}>
          {/* Search and Filters Card */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Doctor Management</h2>
                <Button 
                  variant="primary" 
                  onClick={handleShowAddDoctorModal} 
                  className="d-flex align-items-center"
                >
                  <Plus className="me-2" /> Add Doctor
                </Button>
              </div>
              
              {/* Search and Entries */}
              <div className="d-flex flex-wrap justify-content-between align-items-end">
                <Form.Group className="patient-search-form">
                  <Form.Label>Search by Name:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter doctor name..."
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

          {/* Table Card */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="py-3">Doctor Name</th>
                    <th className="py-3">Email</th>
                    <th className="py-3">Specialty</th>
                    <th className="py-3">Account Status</th>
                    <th className="py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.map((row) => {
                    const fullName = `${row.dr_firstName} ${row.dr_middleInitial || ''} ${row.dr_lastName}`;
                    return (
                    <tr key={row._id} className="align-middle">
                      <td className="py-3">{fullName}</td>
                      <td>{row.dr_email || 'No Email'}</td>
                      <td>{row.dr_specialty}</td>
                      <td>
                        <Badge bg={getBadgeVariant(row.accountStatus)} pill className="status-badge">
                          {row.accountStatus}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          title="View Details"
                          onClick={() => handleViewDoctorDetails(row)}
                        >
                          <Eye className="me-1" /> Details
                        </Button>
                      </td>
                    </tr>
                  )})}
                  
                  {currentEntries.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No doctors found matching your search criteria
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

          {/* Add Doctor Modal */}
          <AddDoctorModal 
            show={showAddDoctorModal} 
            handleClose={handleCloseAddDoctorModal} 
            setDoctors={setDoctors} 
          />

          {/* Action Confirmation Modal (Register/Deactivate) - kept for future use if needed */}
          <Modal show={showActionModal} onHide={handleCloseActionModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Action</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to <strong>{modalAction}</strong> the doctor "<strong>{selectedDoctor?.dr_firstName} {selectedDoctor?.dr_lastName}</strong>"?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseActionModal}>
                Cancel
              </Button>
              <Button
                variant={modalAction === 'register' ? 'success' : 'danger'}
                onClick={handleAction}
              >
                {modalAction.charAt(0).toUpperCase() + modalAction.slice(1)}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Manage Doctor Modal */}
          <Modal 
            dialogClassName="modal-90w" 
            show={showManageDoctorModal} 
            onHide={handleCloseManageDoctorModal} 
            size="xl" 
            backdrop="static"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Manage Doctor</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
              {selectedDoctor && <ManageDoctorMain did={selectedDoctor._id} showModal={true} />}
            </Modal.Body>
            <Modal.Footer>
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