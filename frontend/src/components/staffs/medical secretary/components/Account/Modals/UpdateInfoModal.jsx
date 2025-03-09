// UpdateInfoModal.jsx

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../../../ContentExport';
import ChangePasswordModal from './ChangePasswordModal';
import Swal from 'sweetalert2';

const UpdateInfoModal = ({ show, handleClose, currentData = {} }) => {
  const [updatedData, setUpdatedData] = useState({
    ms_firstName: '',
    ms_lastName: '',
    ms_username: '',
    ms_email: '',
    ms_contactNumber: ''
  });
  
  const [initialData, setInitialData] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // UseEffect to populate the modal with the current data when it's opened
  useEffect(() => {
    if (currentData) {
      const formattedData = {
        ms_firstName: currentData.ms_firstName || '',
        ms_lastName: currentData.ms_lastName || '',
        ms_username: currentData.ms_username || '',
        ms_email: currentData.ms_email || '',
        ms_contactNumber: currentData.ms_contactNumber || ''
      };
      
      setUpdatedData(formattedData);
      setInitialData(formattedData);
      setIsDirty(false); // Reset dirty state when modal opens
    }
  }, [currentData, show]);
  
  // Check if data has been modified
  useEffect(() => {
    if (show) {
      const hasChanges = Object.keys(updatedData).some(
        key => updatedData[key] !== initialData[key]
      );
      setIsDirty(hasChanges);
    }
  }, [updatedData, initialData, show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Confirmation dialog before saving changes
    Swal.fire({
      title: 'Confirm Changes',
      text: 'Are you sure you want to save these changes?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save changes',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        saveChanges();
      }
    });
  };
  
  const saveChanges = () => {
    axios.put(`${ip.address}/api/medicalsecretary/api/${currentData._id}/update`, updatedData)
      .then(response => {
        Swal.fire({
          title: 'Success!',
          text: 'Your information has been updated.',
          icon: 'success',
          confirmButtonColor: '#3085d6'
        });
        handleClose(updatedData); // Pass the updated data back to the form
      })
      .catch(err => {
        console.error('Error updating Medical Secretary data:', err);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update your information.',
          icon: 'error',
          confirmButtonColor: '#3085d6'
        });
      });
  };
  
  const handleModalClose = () => {
    if (isDirty) {
      // Show confirmation dialog if there are unsaved changes
      Swal.fire({
        title: 'Unsaved Changes',
        text: 'You have unsaved changes. Do you want to discard them?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, discard changes',
        cancelButtonText: 'No, keep editing'
      }).then((result) => {
        if (result.isConfirmed) {
          handleClose(); // Close the modal without saving
        }
      });
    } else {
      handleClose(); // No changes, close directly
    }
  };

  return (
    <Modal show={show} onHide={handleModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>Update Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formFirstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="ms_firstName"
              value={updatedData.ms_firstName || ''}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formLastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="ms_lastName"
              value={updatedData.ms_lastName || ''}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="ms_username"
              value={updatedData.ms_username || ''}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="ms_email"
              value={updatedData.ms_email || ''}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formContactNumber">
            <Form.Label>Contact Number</Form.Label>
            <Form.Control
              type="text"
              name="ms_contactNumber"
              value={updatedData.ms_contactNumber || ''}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" className="me-2" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!isDirty}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateInfoModal;