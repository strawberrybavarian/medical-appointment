import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import './UploadImageModal.css'
import { specialties } from "../../../../ContentExport";
const UpdateInfoModal = ({ show, handleClose, doctorData, handleUpdate }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData(doctorData);
  }, [doctorData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdate(formData);
  };

  return (
    <Modal show={show} onHide={handleClose}  overlayClassName="modal-overlay" backdrop="static" keyboard={false} ariaHideApp={false}  >
      <Modal.Header className="uim-header" closeButton>
        <Modal.Title>Update Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="firstName">
            <Form.Label>First Name:</Form.Label>
            <Form.Control
              name="dr_firstName"
              value={formData.dr_firstName || ""}
              onChange={handleChange}
            />
          </Form.Group>
          <Row>
            <Form.Group as={Col} controlId="lastName">
              <Form.Label>Last Name:</Form.Label>
              <Form.Control
                name="dr_lastName"
                value={formData.dr_lastName || ""}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group as={Col} controlId="middleInitial">
              <Form.Label>Middle Initial:</Form.Label>
              <Form.Control
                name="dr_middleInitial"
                value={formData.dr_middleInitial || ""}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>
          <Form.Group controlId="email">
            <Form.Label>Email:</Form.Label>
            <Form.Control
              name="dr_email"
              value={formData.dr_email || ""}
              onChange={handleChange}
            />
          </Form.Group>
          <Row>
          <Form.Group as={Col} controlId="dob">
            <Form.Label>Birthdate:</Form.Label>
            <Form.Control
              type='date'
              name="dr_dob"
              value={formData.dr_dob ? new Date(formData.dr_dob).toISOString().split('T')[0] : ""}
              onChange={handleChange}
            />
          </Form.Group>
            <Form.Group as={Col} controlId="contactNumber">
              <Form.Label>Contact Number:</Form.Label>
              <Form.Control
                name="dr_contactNumber"
                value={formData.dr_contactNumber || ""}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>
          <Form.Group controlId="password">
            <Form.Label>Password:</Form.Label>
            <Form.Control
              type="password"
              name="dr_password"
              value={formData.dr_password || ""}
              onChange={handleChange}
            />


          </Form.Group>

          <Form.Group controlId="password">
            <Form.Label>Specialty:</Form.Label>
            <Form.Select
              name="dr_specialty"
              value={formData.dr_specialty || ""}
              onChange={handleChange}
            >
              <option value="">Select a specialty</option>
              {specialties.map((specialty, index) => (
                <option key={index} value={specialty}>
                  {specialty}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <div style={{ textAlign: "center", marginTop: '20px' }}>
            <Button variant="primary" type="submit">
              Update
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateInfoModal;
