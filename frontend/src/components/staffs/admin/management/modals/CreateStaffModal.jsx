import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';

const CreateStaffModal = ({ show, handleClose, handleStaffCreation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [role, setRole] = useState('Medical Secretary');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !contactNumber || !role) {
      setErrorMessage('All fields are required');
      return;
    }

    try {
      let endpoint = '';
      let payload = {};

      // Determine which API endpoint and payload to use based on the selected role
      if (role === 'Medical Secretary') {
        endpoint = `${ip.address}/api/medicalsecretary/api/signup`;
        payload = {
          ms_firstName: firstName,
          ms_lastName: lastName,
          ms_email: email,
          ms_contactNumber: contactNumber,
          role,
        };
      } else if (role === 'Admin') {
        endpoint = `${ip.address}/api/admin/api/signup`;
        payload = {
          firstName,
          lastName,
          email,
          contactNumber,
          role,
        };
      }

      // Post request to register the new staff member
      const response = await axios.post(endpoint, payload);

      handleStaffCreation(response.data); // Notify parent about the new staff
      handleClose(); // Close the modal
    } catch (error) {
      console.error('Error registering staff:', error);
      setErrorMessage('Failed to register staff. Please try again.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create New Staff</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <Form>
          <Form.Group controlId="firstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="lastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="contactNumber">
            <Form.Label>Contact Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter contact number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="role">
            <Form.Label>Role</Form.Label>
            <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Medical Secretary">Medical Secretary</option>
              <option value="Admin">Admin</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleRegister}>
          Register
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateStaffModal;
