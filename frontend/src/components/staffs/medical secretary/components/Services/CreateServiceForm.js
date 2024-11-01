// CreateServiceForm.js
import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Modal } from "react-bootstrap";
import Select from "react-select";
import axios from "axios";
import { ip } from "../../../../../ContentExport";

function CreateServiceForm({ show, onClose, patientId, patientName }) {
  const [serviceId, setServiceId] = useState(null); // Selected service
  const [services, setServices] = useState([]); // List of services
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch services and patients
  useEffect(() => {
    // Fetch services
    axios
      .get(`${ip.address}/api/admin/getall/services`)
      .then((res) => {
        const serviceOptions = res.data.map((service) => ({
          value: service._id,
          label: service.name,
        }));
        setServices(serviceOptions);
      })
      .catch((err) => console.error(err));

    // Fetch patients
    axios
      .get(`${ip.address}/api/patient/api/allpatient`)
      .then((res) => {
        const patientOptions = res.data.thePatient.map((patient) => ({
          value: patient._id,
          label: `${patient.patient_firstName} ${patient.patient_middleInitial || ''} ${patient.patient_lastName}`,
        }));
        setPatients(patientOptions);

        // If patientId is provided, set selectedPatient
        if (patientId) {
          const matchedPatient = patientOptions.find((p) => p.value === patientId);
          if (matchedPatient) {
            setSelectedPatient(matchedPatient);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [patientId]);

  const openConfirmationModal = () => {
    if (!serviceId || !selectedPatient || !date || !reason) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setShowConfirmation(true);
  };

  const confirmAppointment = () => {
    const formData = {
      date,
      reason,
      serviceId: serviceId.value, // Send the service ID
      appointment_type: [{ appointment_type: serviceId.label }],
    };

    axios
      .post(`${ip.address}/api/patient/api/${selectedPatient.value}/createserviceappointment`, formData)
      .then(() => {
        alert("Appointment created successfully!");
        onClose();
        window.location.reload();
      })
      .catch((err) => {
        const message = err.response?.data?.message || "An error occurred.";
        setError(`Error: ${message}`);
      });
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format YYYY-MM-DD
  };

  return (
    <>
      <Modal show={show} onHide={onClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Service Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select Service</Form.Label>
              <Select
                options={services}
                value={serviceId}
                onChange={setServiceId}
                placeholder="Choose a service"
                isClearable
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Select Patient</Form.Label>
              <Select
                options={patients}
                value={selectedPatient}
                onChange={setSelectedPatient}
                placeholder="Choose a patient"
                isClearable
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                min={getTodayDate()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Primary Concern</Form.Label>
              <Form.Control
                as="textarea"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={openConfirmationModal}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showConfirmation}
        onHide={() => setShowConfirmation(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Service:</strong> {serviceId?.label}
          </p>
          <p>
            <strong>Patient:</strong> {selectedPatient?.label}
          </p>
          <p>
            <strong>Date:</strong> {date}
          </p>
          <p>
            <strong>Primary Concern:</strong> {reason}
          </p>
          <p>Do you want to confirm this appointment?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmation(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmAppointment}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CreateServiceForm;
