import axios from 'axios';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { ip } from '../../ContentExport';
import Swal from 'sweetalert2';

const TwoFactorVerificationModal = ({ show, onClose, onVerify, userId }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to handle when the user types in a code box
  const handleChange = (e, index) => {
    const value = e.target.value;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Focus next input field when the current one is filled
    if (value && index < 5) {
      document.getElementById(`code-input-${index + 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Join the 6 digits into a single string
    const enteredCode = code.join('');
    
    if (enteredCode.length !== 6) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please enter a 6-digit code.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(`${ip.address}/api/verify-2fa`, { userId, code: enteredCode });

      if (response.data.verified) {
        onVerify(); // Call the onVerify function passed from parent
        Swal.fire({
          icon: 'success',
          title: '2FA Verified',
          text: 'You have successfully verified your account.',
        });
        onClose(); // Close the modal
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Code',
          text: 'The 6-digit code you entered is incorrect. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while verifying the code.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!show) {
      // Clear the code when the modal is closed
      setCode(['', '', '', '', '', '']);
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Enter 2FA Code</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="justify-content-center">
            {code.map((digit, index) => (
              <Col xs={2} key={index} className="mx-1">
                <Form.Control
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  id={`code-input-${index}`}
                  className="text-center"
                  autoFocus={index === 0}
                />
              </Col>
            ))}
          </Row>
          <div className="text-center mt-3">
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              className="w-100"
            >
              {isSubmitting ? 'Verifying...' : 'Verify Code'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default TwoFactorVerificationModal;
