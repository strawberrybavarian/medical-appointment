import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../ContentExport';

const CreateStaffModal = ({ show, handleClose, user, onComplete }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Use effect to set the old password from the user prop when modal opens
  useEffect(() => {
    if (user && user.ms_password) {
      setOldPassword(user.ms_password);
    }
  }, [user]);

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      // Make the request to change the password
      await axios.put(`${ip.address}/api/medicalsecretary/api/change-password/${user._id}`, {
        oldPassword,
        newPassword,
        confirmNewPassword,
      });

      setSuccessMessage('Password changed successfully!');
      onComplete();  // Call onComplete to hide modal and proceed
    } catch (error) {
      setErrorMessage('Failed to change password. Please try again.');
      console.log(error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Change Your Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        <Form>
          <Form.Group controlId="newPassword">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="confirmNewPassword">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleChangePassword}>
          Change Password
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateStaffModal;
