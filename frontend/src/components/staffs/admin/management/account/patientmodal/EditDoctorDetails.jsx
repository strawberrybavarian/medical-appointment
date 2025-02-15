import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import { ip } from "../../../../../../ContentExport";

const EditDoctorDetails = ({ show, handleClose, doctorData, handleUpdate }) => {
  const [formData, setFormData] = useState({});
  const [specialties, setSpecialties] = useState([]);

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
      const response = await axios.get(`${ip.address}/api/find/admin/specialties`);
      if (Array.isArray(response.data)) {
        setSpecialties(response.data);
      } else {
        setSpecialties([]);
      }
    } catch (error) {
      console.error("Error fetching specialties:", error);
      setSpecialties([]);
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
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} ariaHideApp={false}>
      <Modal.Header closeButton>
        <Modal.Title>Update Doctor Information</Modal.Title>
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
          <Row>
            <Form.Group as={Col} controlId="dob">
              <Form.Label>Birthdate:</Form.Label>
              <Form.Control
                type="date"
                name="dr_dob"
                value={formData.dr_dob || ""}
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
              value={formData.dr_specialty || ""}
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

export default EditDoctorDetails;
