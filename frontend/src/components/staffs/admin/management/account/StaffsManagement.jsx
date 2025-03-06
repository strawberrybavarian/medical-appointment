import React, { useState, useEffect } from 'react';
import { Button, Container, Modal, Form, Table, Pagination, Badge, Card } from 'react-bootstrap';
import { ChatDotsFill, Eye, Plus } from 'react-bootstrap-icons';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';
import AdminNavbar from '../../navbar/AdminNavbar';
import SidebarAdmin from '../../sidebar/SidebarAdmin';
import CreateStaffModal from '../modals/CreateStaffModal';
import MedicalSecretaryDetailsModal from './patientmodal/MedicalSecretaryDetailsModal';
import ChatComponent from '../../../../chat/ChatComponent';

function StaffsManagement() {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [showChat, setShowChat] = useState(false);
  const location = useLocation();
  const { userId, userName, role } = location.state || {};

  useEffect(() => {
    axios.get(`${ip.address}/api/admin/api/staff/all`)
      .then((result) => setStaff(result.data.staff))
      .catch((error) => console.log(error));
  }, []);

  const handleShowModal = (staffMember, action) => {
    setSelectedStaff(staffMember);
    setModalAction(action);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStaff(null);
  };

  const handleAction = () => {
    const status = modalAction === 'register' ? 'Registered' : 'Deactivated';
    const role = selectedStaff.role === 'Admin' ? 'admin' : 'medicalSecretary';

    axios.put(`${ip.address}/api/admin/api/staff/account-status/${selectedStaff._id}`, { status, role })
      .then(() => {
        setStaff(staff.map(stf => stf._id === selectedStaff._id ? { ...stf, accountStatus: status } : stf));
        handleCloseModal();
      })
      .catch((error) => console.log(error));
  };

  const handleStaffCreation = (newStaff) => {
    setStaff([...staff, newStaff]);
  };

  const handleViewDetails = (staffMember) => {
    setSelectedStaff(staffMember);
  };

  const handleSort = (key) => {
    setSortConfig((prevSortConfig) => ({
      key,
      direction: prevSortConfig.key === key && prevSortConfig.direction === 'ascending' ? 'descending' : 'ascending',
    }));
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

  const filteredStaff = staff.filter(staffMember => {
    const fullName = staffMember.role === 'Medical Secretary'
      ? `${staffMember.ms_firstName} ${staffMember.ms_lastName}`
      : `${staffMember.firstName} ${staffMember.lastName}`;
    return fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sortedStaff = [...filteredStaff].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const getValueByKey = (obj, key) => {
      if (obj.role === 'Medical Secretary') {
        return key === 'firstName' ? obj.ms_firstName : 
               key === 'lastName' ? obj.ms_lastName : 
               key === 'email' ? obj.ms_email : obj[key];
      }
      return obj[key];
    };
    
    const aValue = getValueByKey(a, sortConfig.key);
    const bValue = getValueByKey(b, sortConfig.key);
    
    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = sortedStaff.slice(indexOfFirstEntry, indexOfLastEntry);
  const pageNumbers = Array.from({ length: Math.ceil(sortedStaff.length / entriesPerPage) }, (_, i) => i + 1);

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
                <h2>Staff Management</h2>
                <Button 
                  variant="primary" 
                  onClick={() => setShowCreateModal(true)} 
                  className="d-flex align-items-center"
                >
                  <Plus className="me-2" /> Add Staff
                </Button>
              </div>
              
              {/* Search and Entries */}
              <div className="d-flex flex-wrap justify-content-between align-items-end">
                <Form.Group className="patient-search-form">
                  <Form.Label>Search by Name:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter staff name..."
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
                    <th 
                      className="py-3 px-4" 
                      onClick={() => handleSort('firstName')}
                      style={{ cursor: 'pointer' }}
                    >
                      Name {sortConfig.key === 'firstName' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                    </th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.map((row) => {
                    const fullName = row.role === 'Medical Secretary'
                      ? `${row.ms_firstName} ${row.ms_lastName}`
                      : `${row.firstName} ${row.lastName}`;
                    const email = row.role === 'Medical Secretary' ? row.ms_email : row.email;
                    return (
                      <tr key={row._id} className="align-middle">
                        <td className="py-3 px-4">{fullName}</td>
                        <td className="py-3 px-4">{email}</td>
                        <td className="py-3 px-4">{row.role}</td>
                        
                        <td className="py-3 px-4 text-center">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            title="View Details"
                            onClick={() => handleViewDetails(row)}
                          >
                            <Eye className="me-1" /> Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {currentEntries.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No staff found matching your search criteria
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
          <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Action</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to <strong>{modalAction}</strong> the staff member "<strong>{selectedStaff?.ms_firstName || selectedStaff?.firstName} {selectedStaff?.ms_lastName || selectedStaff?.lastName}</strong>"?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
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

          {/* Create Staff Modal */}
          <CreateStaffModal
            show={showCreateModal}
            handleClose={() => setShowCreateModal(false)}
            handleStaffCreation={handleStaffCreation}
          />

          {/* Medical Secretary Modal */}
          <MedicalSecretaryDetailsModal
            show={selectedStaff !== null}
            msid={selectedStaff?._id}
            handleClose={() => setSelectedStaff(null)}
            handleUpdate={(updatedStaff) => {
              setStaff(staff.map(st => st._id === updatedStaff._id ? updatedStaff : st));
            }}
          />
        </Container>
      </Container>
    </div>
  );
}

export default StaffsManagement;