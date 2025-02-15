import React, { useState, useEffect } from 'react';
import { Button, Container, Modal, Form, Dropdown, Table, Pagination } from 'react-bootstrap';
import { ThreeDots } from 'react-bootstrap-icons';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';
import AdminNavbar from '../../navbar/AdminNavbar';
import SidebarAdmin from '../../sidebar/SidebarAdmin';
import CreateStaffModal from '../modals/CreateStaffModal';
import MedicalSecretaryDetailsModal from './patientmodal/MedicalSecretaryDetailsModal';

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

  const filteredStaff = staff.filter(staffMember => {
    const fullName = staffMember.role === 'Medical Secretary'
      ? `${staffMember.ms_firstName} ${staffMember.ms_lastName}`
      : `${staffMember.firstName} ${staffMember.lastName}`;
    return fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSort = (key) => {
    setSortConfig((prevSortConfig) => ({
      key,
      direction: prevSortConfig.key === key && prevSortConfig.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  const sortedStaff = [...staff].sort((a, b) => {
    if (!sortConfig.key) return 0;
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = sortedStaff.slice(indexOfFirstEntry, indexOfLastEntry);

  const pageNumbers = Array.from({ length: Math.ceil(sortedStaff.length / entriesPerPage) }, (_, i) => i + 1);

  return (
    <div className="d-flex">
      <SidebarAdmin userId={userId} userName={userName} role={role} />
      <div style={{ width: '100%' }}>
        <AdminNavbar userId={userId} userName={userName} role={role} />

        <Container className="ad-container" style={{ height: 'calc(100vh - 56px)', overflowY: 'auto', padding: '20px' }}>
          <h1>Staff Management</h1>

          <Form.Group controlId="formStaffSearch" className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>

          <Button className="mb-3" onClick={() => setShowCreateModal(true)}>
            Create Staff
          </Button>

          <Table responsive striped variant="light" className="mt-3">
            <thead>
              <tr>
                <th onClick={() => handleSort('patient_firstName')}>
                  Name {sortConfig.key === 'patient_firstName' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th>Email</th>
                <th>Role</th>

                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.map((row) => {
                const fullName = row.role === 'Medical Secretary'
                  ? `${row.ms_firstName} ${row.ms_lastName}`
                  : `${row.firstName} ${row.lastName}`;
                return (
                  <tr key={row._id}>
                    <td>{fullName}</td>
                    <td>{row.role === 'Medical Secretary' ? row.ms_email : row.email}</td>
                    <td>{row.role}</td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle variant="link" className="p-0">
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
                          <Dropdown.Item
                            onClick={() => setSelectedStaff(row)}
                          >
                            Edit Details
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                );
              })}
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

          {/* Modals */}
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Action</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to {modalAction} the staff member "{selectedStaff?.ms_firstName || selectedStaff?.firstName} {selectedStaff?.ms_lastName || selectedStaff?.lastName}"?
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

          <CreateStaffModal
            show={showCreateModal}
            handleClose={() => setShowCreateModal(false)}
            handleStaffCreation={handleStaffCreation}
          />

          {/* Medical Secretary Modal */}
          <MedicalSecretaryDetailsModal
            show={selectedStaff !== null} // Only show the modal if selectedStaff exists
            msid={selectedStaff?._id} // Pass the staff ID if selectedStaff exists
            handleClose={() => setSelectedStaff(null)} // Close modal
            handleUpdate={(updatedStaff) => {
              setStaff(staff.map(st => st._id === updatedStaff._id ? updatedStaff : st));
            }}
          />

        </Container>
      </div>
    </div>
  );
}

export default StaffsManagement;
