// File: ./modal/ChangePasswordModal.js

import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { ip } from "../../../../ContentExport";
import PasswordValidation from "../../../login/PasswordValidation";
import Swal from 'sweetalert2';

const ChangePasswordModal = ({ show, handleClose, doctorData }) => {
  const [formData, setFormData] = useState({
    dr_email: "",
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [initialValues, setInitialValues] = useState({
    dr_email: "",
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // Set initial email when the modal opens
  useEffect(() => {
    if (show && doctorData) {
      const initialFormData = {
        dr_email:  "",
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      };
      setFormData(initialFormData);
      setInitialValues(initialFormData);
      setIsDirty(false);
      setErrors({});
    }
  }, [show, doctorData]);

  // Track if form has been modified
  useEffect(() => {
    if (show) {
      const hasChanges = 
        formData.oldPassword !== initialValues.oldPassword ||
        formData.newPassword !== initialValues.newPassword ||
        formData.confirmNewPassword !== initialValues.confirmNewPassword;
        
      setIsDirty(hasChanges);
    }
  }, [formData, initialValues, show]);

  // Function to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Function to validate form data
  const validate = () => {
    const errors = {};
    if (formData.dr_email !== doctorData.email) {
      errors.dr_email = "Email does not match your registered email.";
    }
    if (!formData.oldPassword) {
      errors.oldPassword = "Please enter your current password.";
    }
    if (!formData.newPassword) {
      errors.newPassword = "Please enter a new password.";
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      errors.confirmNewPassword = "New passwords do not match.";
    }
    // Optional: Add password strength validation here
    return errors;
  };

  // Function to handle form submission with confirmation
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // Show confirmation dialog before submitting
      Swal.fire({
        title: 'Confirm Password Change',
        text: 'Are you sure you want to change your password?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, change it',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          submitPasswordChange();
        }
      });
    }
  };

  // Actual submission function
  const submitPasswordChange = async () => {
    try {
      await axios.put(
        `${ip.address}/api/doctor/api/${doctorData.theId}/changePassword`,
        {
          dr_email: formData.dr_email,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }
      );
      
      Swal.fire({
        title: 'Success!',
        text: 'Password changed successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      setIsDirty(false);
      handleClose();
    } catch (error) {
      console.error("Error changing password:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrors({ serverError: error.response.data.message });
      } else {
        setErrors({
          serverError: "An error occurred while changing the password.",
        });
      }
    }
  };

  // Handle modal close with confirmation if dirty
  const handleModalClose = () => {
    if (isDirty) {
      Swal.fire({
        title: 'Discard changes?',
        text: 'You have unsaved changes. Are you sure you want to close?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Discard changes',
        cancelButtonText: 'Continue editing',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          handleClose();
        }
      });
    } else {
      handleClose();
    }
  };

  return (
    <Modal show={show} onHide={handleModalClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Change Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="dr_email" className="mb-3">
            <Form.Label>Email:</Form.Label>
            <Form.Control
              type="email"
              name="dr_email"
              value={formData.dr_email}
              onChange={handleChange}
              placeholder="Enter your email"
      
            />
            {errors.dr_email && (
              <Form.Text className="text-danger">{errors.dr_email}</Form.Text>
            )}
          </Form.Group>

          <Form.Group controlId="oldPassword" className="mb-3">
            <Form.Label>Current Password:</Form.Label>
            <Form.Control
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
            />
            {errors.oldPassword && (
              <Form.Text className="text-danger">
                {errors.oldPassword}
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group controlId="newPassword" className="mb-3">
            <Form.Label>New Password:</Form.Label>
            <Form.Control
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter a new password"
            />
            {errors.newPassword && (
              <Form.Text className="text-danger">
                {errors.newPassword}
              </Form.Text>
            )}
            {formData.newPassword && (
              <div className="mt-2">
                <PasswordValidation password={formData.newPassword} />
              </div>
            )}
          </Form.Group>

          <Form.Group controlId="confirmNewPassword" className="mb-3">
            <Form.Label>Confirm New Password:</Form.Label>
            <Form.Control
              type="password"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              placeholder="Re-enter your new password"
            />
            {errors.confirmNewPassword && (
              <Form.Text className="text-danger">
                {errors.confirmNewPassword}
              </Form.Text>
            )}
          </Form.Group>

          {errors.serverError && (
            <Form.Text className="text-danger">{errors.serverError}</Form.Text>
          )}

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Button variant="primary" type="submit">
              Change Password
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ChangePasswordModal;