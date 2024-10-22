// File: ./modal/ChangePasswordModal.js

import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { ip } from "../../../../ContentExport";

const ChangePasswordModal = ({ show, handleClose, doctorData }) => {
  const [formData, setFormData] = useState({
    dr_email: "",
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [errors, setErrors] = useState({});

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

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        await axios.put(
          `${ip.address}/api/doctor/api/${doctorData.theId}/changePassword`,
          {
            dr_email: formData.dr_email,
            oldPassword: formData.oldPassword,
            newPassword: formData.newPassword,
          }
        );
        alert("Password changed successfully.");
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
    }
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Change Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="dr_email">
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

          <Form.Group controlId="oldPassword">
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

          <Form.Group controlId="newPassword">
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
          </Form.Group>

          <Form.Group controlId="confirmNewPassword">
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
