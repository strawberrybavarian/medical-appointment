import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { ip } from "../../ContentExport"; // Adjust the import path as necessary

function LabResultModal({ show, handleClose }) {
  const [patientID, setPatientID] = useState("");
  const [appointmentID, setAppointmentID] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setError("");
    setLoading(true);

    try {
      // Fetch the patient data by Patient_ID
      const patientResponse = await axios.get(
        `${ip.address}/api/patient/getpatientbyid/${patientID}`
      );

      const patient = patientResponse.data.patient;

      if (!patient) {
        setError("Patient not found.");
        setLoading(false);
        return;
      }

      if (patient.accountStatus !== "Unregistered") {
        setError(
          "Your account is not unregistered. Please log in to access your lab results."
        );
        setLoading(false);
        return;
      }

      // Fetch the laboratory result using the Appointment_ID
      const labResponse = await axios.get(
        `${ip.address}/api/laboratory/getbyappointment/${appointmentID}`
      );

      const laboratory = labResponse.data.laboratory;

      if (!laboratory || laboratory.patient !== patient._id) {
        setError("Laboratory result not found for this appointment.");
        setLoading(false);
        return;
      }

      if (!laboratory.file || !laboratory.file.path) {
        setError("No laboratory file available for download.");
        setLoading(false);
        return;
      }

      // Proceed to download the file
      const fullUrl = `${ip.address}/${laboratory.file.path}`;

      const response = await axios.get(fullUrl, {
        responseType: "blob",
      });

      // Create a new Blob object using the response data
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", laboratory.file.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setLoading(false);
      handleClose();
    } catch (err) {
      console.error("Error downloading the lab result:", err);
      setError("An error occurred while fetching the lab result.");
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Download Lab Result</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group controlId="patientID">
            <Form.Label>Patient ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your Patient ID"
              value={patientID}
              onChange={(e) => setPatientID(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="appointmentID">
            <Form.Label>Appointment ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your Appointment ID"
              value={appointmentID}
              onChange={(e) => setAppointmentID(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Close
        </Button>
        <Button variant="primary" onClick={handleDownload} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Download"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LabResultModal;
