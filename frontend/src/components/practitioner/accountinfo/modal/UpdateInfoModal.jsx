import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios"; // Use axios to fetch specialties from the backend
import { ip } from "../../../../ContentExport";

const UpdateInfoModal = ({ show, handleClose, doctorData, handleUpdate }) => {
  const [formData, setFormData] = useState({});
  const [specialties, setSpecialties] = useState([]); // State for storing specialties from the backend

  // Update formData when doctorData is received
  useEffect(() => {
    if (doctorData) {
      setFormData(doctorData);
    }
  }, [doctorData]);

  // Fetch specialties from the backend when the modal is opened
  useEffect(() => {
    if (show) {
      fetchSpecialties();
    }
  }, [show]);

  const fetchSpecialties = async () => {
    try {
      const response = await axios.get(`${ip.address}/api/admin/specialties`); // Replace with your actual backend URL
      if (Array.isArray(response.data)) {
        setSpecialties(response.data); // Assuming the data is an array of specialties
      } else {
        setSpecialties([]); // Default to an empty array if the response isn't an array
      }
    } catch (error) {
      console.error("Error fetching specialties:", error);
      setSpecialties([]); // Set an empty array if an error occurs
    }
  };

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
    <Modal
      show={show}
      onHide={handleClose}
      overlayClassName="modal-overlay"
      backdrop="static"
      keyboard={false}
      ariaHideApp={false}
    >
      <Modal.Header className="uim-header" closeButton>
        <Modal.Title>Update Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="firstName">
            <Form.Label>First Name:</Form.Label>
            <Form.Control
              name="dr_firstName"
              value={formData.dr_firstName || doctorData.theName}
              onChange={handleChange}
            />
          </Form.Group>
          <Row>
            <Form.Group as={Col} controlId="lastName">
              <Form.Label>Last Name:</Form.Label>
              <Form.Control
                name="dr_lastName"
                value={formData.dr_lastName || doctorData.theLastName}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group as={Col} controlId="middleInitial">
              <Form.Label>Middle Initial:</Form.Label>
              <Form.Control
                name="dr_middleInitial"
                value={formData.dr_middleInitial || doctorData.theMI}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>
          {/* <Form.Group controlId="email">
            <Form.Label>Email:</Form.Label>
            <Form.Control
              name="dr_email"
              value={formData.dr_email || doctorData.email}
              onChange={handleChange}
            />
          </Form.Group> */}
          <Row>
            <Form.Group as={Col} controlId="dob">
              <Form.Label>Birthdate:</Form.Label>
              <Form.Control
                type="date"
                name="dr_dob"
                value={
                  formData.dr_dob
                    ? new Date(formData.dr_dob).toISOString().split("T")[0]
                    : doctorData.dob
                    ? new Date(doctorData.dob).toISOString().split("T")[0]
                    : ""
                }
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

          <Form.Group controlId="specialty">
            <Form.Label>Specialty:</Form.Label>
            <Form.Select
              name="dr_specialty"
              value={formData.dr_specialty || doctorData.specialty}
              onChange={handleChange}
            >
              <option value="">Select a specialty</option>
              {specialties.length > 0 &&
                specialties.map((specialty, index) => (
                  <option key={index} value={specialty.name}>
                    {specialty.name}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
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
