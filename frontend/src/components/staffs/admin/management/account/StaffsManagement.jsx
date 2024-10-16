import React, { useState, useEffect } from 'react';
import { Button, Container, Modal, Form, Dropdown } from 'react-bootstrap';
import { ThreeDots } from 'react-bootstrap-icons'; // ThreeDots icon for actions
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';
import AdminNavbar from '../../navbar/AdminNavbar';
import SidebarAdmin from '../../sidebar/SidebarAdmin';
import CreateStaffModal from '../modals/CreateStaffModal';
import DataTable from 'react-data-table-component';
import styled from 'styled-components';

// Styled components for DataTable customization
const CustomStyles = {
  rows: {
    style: {
      minHeight: '60px', // Row height
    },
  },
  headCells: {
    style: {
      backgroundColor: '#f5f5f5',
      fontWeight: 'bold',
    },
  },
  cells: {
    style: {
      padding: '8px',
    },
  },
};

function StaffsManagement() {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const columns = [
    { name: '#', selector: (row, index) => index + 1, width: '50px' },
    {
      name: 'Staff Name',
      selector: row => row.role === 'Medical Secretary'
        ? `${row.ms_firstName} ${row.ms_lastName}`
        : `${row.firstName} ${row.lastName}`,
      sortable: true,
    },
    {
      name: 'Email',
      selector: row => row.role === 'Medical Secretary' ? row.ms_email : row.email,
      sortable: true,
    },
    { name: 'Role', selector: row => row.role, sortable: true },
    { name: 'Account Status', selector: row => row.accountStatus, sortable: true },
    {
      name: 'Actions',
      cell: (row) => (
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
          </Dropdown.Menu>
        </Dropdown>
      ),
    },
  ];

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

          <DataTable
            columns={columns}
            data={filteredStaff}
            customStyles={CustomStyles}
            pagination
            highlightOnHover
            striped
            responsive
          />

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
        </Container>
      </div>
    </div>
  );
}

export default StaffsManagement;
