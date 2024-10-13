// UpdateInfoModal.jsx

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../../../ContentExport';
import ChangePasswordModal from './ChangePasswordModal';

const UpdateInfoModal = ({ show, handleClose, currentData = {} }) => {
  const [updatedData, setUpdatedData] = useState({
    ms_firstName: '',
    ms_lastName: '',
    ms_username: '',
    ms_email: '',
    ms_contactNumber: ''
  });

  // UseEffect to populate the modal with the current data when it's opened
  useEffect(() => {
    if (currentData) {
      setUpdatedData({
        ms_firstName: currentData.ms_firstName || '',
        ms_lastName: currentData.ms_lastName || '',
        ms_username: currentData.ms_username || '',
        ms_email: currentData.ms_email || '',
        ms_contactNumber: currentData.ms_contactNumber || ''
      });
    }
  }, [currentData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`${ip.address}/medicalsecretary/api/${currentData._id}/update`, updatedData)
      .then(response => {
        handleClose(updatedData); // Pass the updated data back to the form
      })
      .catch(err => {
        console.error('Error updating Medical Secretary data:', err);
      });
  };

  return (
    <Modal show={show} onHide={() => handleClose()}>
      <Modal.Header closeButton>
        <Modal.Title>Update Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formFirstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="ms_firstName"
              value={updatedData.ms_firstName || ''}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formLastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="ms_lastName"
              value={updatedData.ms_lastName || ''}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="ms_username"
              value={updatedData.ms_username || ''}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="ms_email"
              value={updatedData.ms_email || ''}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formContactNumber">
            <Form.Label>Contact Number</Form.Label>
            <Form.Control
              type="text"
              name="ms_contactNumber"
              value={updatedData.ms_contactNumber || ''}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateInfoModal;
