import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';
import AdminNavbar from '../../navbar/AdminNavbar';
import SidebarAdmin from '../../sidebar/SidebarAdmin';
import CreateStaffModal from '../modals/CreateStaffModal';
function StaffsManagement() {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false); // State for the "Create Staff" modal
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch all staff members (Admins and Medical Secretaries)
    axios.get(`${ip.address}/admin/api/staff/all`)
      .then((result) => {
        setStaff(result.data.staff);
        console.log(result.data.staff);
      })
      .catch((error) => {
        console.log(error);
      });
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
    const role = selectedStaff.role === 'Admin' ? 'admin' : 'medicalSecretary'; // Assuming 'role' determines the type

    axios.put(`${ip.address}/admin/api/staff/account-status/${selectedStaff._id}`, { status, role })
      .then(() => {
        setStaff(staff.map(stf => stf._id === selectedStaff._id ? { ...stf, accountStatus: status } : stf));
        handleCloseModal();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleStaffCreation = (newStaff) => {
    // Add the newly created staff to the state
    setStaff([...staff, newStaff]);
  };

  const filteredStaff = staff.filter(staffMember => {
    const fullName = staffMember.role === 'Medical Secretary' 
      ? `${staffMember.ms_firstName} ${staffMember.ms_lastName}`
      : `${staffMember.firstName} ${staffMember.lastName}`;
    return fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className='d-flex'>
      <SidebarAdmin />
      <div style={{ width: '100%' }}>
        <AdminNavbar />

        <Container className='ad-container' style={{ height: 'calc(100vh - 56px)', overflowY: 'auto', padding: '20px' }}>
          <h1>Staff Management</h1>

          {/* Search bar */}
          <Form.Group controlId="formStaffSearch">
            <Form.Control
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>

          {/* Create Staff Button */}
          <Button className="mt-3 mb-3" onClick={() => setShowCreateModal(true)}>
            Create Staff
          </Button>

          <Table responsive striped variant="light" className="mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>Staff Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staffMember, index) => {
                const fullName = staffMember.role === 'Medical Secretary'
                  ? `${staffMember.ms_firstName} ${staffMember.ms_lastName}`
                  : `${staffMember.firstName} ${staffMember.lastName}`;

                const email = staffMember.role === 'Medical Secretary'
                  ? staffMember.ms_email
                  : staffMember.email;

                return (
                  <tr key={staffMember._id}>
                    <td>{index + 1}</td>
                    <td>{fullName}</td>
                    <td>{email}</td>
                    <td>{staffMember.role}</td>
                    <td>{staffMember.accountStatus}</td>
                    <td>
                      <div className='d-flex justify-content-around flex-wrap'>
                        <Button variant="primary" onClick={() => handleShowModal(staffMember, 'register')} disabled={staffMember.accountStatus === 'Registered'}>
                          Register
                        </Button>{' '}
                        <Button variant="danger" onClick={() => handleShowModal(staffMember, 'deactivate')} disabled={staffMember.accountStatus === 'Deactivated'}>
                          Deactivate
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {/* Register/Deactivate Modal */}
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

          {/* Create Staff Modal */}
          <CreateStaffModal
            show={showCreateModal}
            handleClose={() => setShowCreateModal(false)}
            handleStaffCreation={handleStaffCreation} // Pass the callback to handle staff creation
          />
        </Container>
      </div>
    </div>
  );
}

export default StaffsManagement;
