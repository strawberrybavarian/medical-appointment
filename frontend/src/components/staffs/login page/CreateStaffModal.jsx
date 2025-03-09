import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../ContentExport';

const CreateStaffModal = ({ show, handleClose, userId, onComplete }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (!userId) {
      setErrorMessage('User ID is missing!');
      return;
    }

    try {
      // Use the changePendingAdminPassword endpoint
      await axios.post(`${ip.address}/api/medicalsecretary/change-pending-password/${userId}`, {
        newPassword,
        confirmNewPassword
      });

      setSuccessMessage('Password changed successfully! Your account is now activated.');

      // Wait for a short delay before reloading the page
      setTimeout(() => {
        window.location.reload(); // Reload the page to reflect changes
      }, 1500); // Increased delay to show the success message

    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to change password. Please try again.');
      console.error('Password change error:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Set Your Password</Modal.Title>
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

          <Form.Group controlId="confirmNewPassword" className="mt-3">
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
          Set Password
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateStaffModal;