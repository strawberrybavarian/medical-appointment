import React, { useState, useEffect } from "react";
import { Button, Form, Table, Container, Card, Row, Col } from "react-bootstrap";
import { PencilSquare, Trash, CheckCircle, XCircle } from 'react-bootstrap-icons'; // Import the icons
import axios from "axios";
import { ip } from "../../../../ContentExport";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrescriptionHistory from "./PrescriptionHistory";

function Prescription({ patientId, appointmentId, doctorId }) {
  const [medication, setMedication] = useState({
    name: "",
    type: "",
    dosage: "",
    frequency: "",
    duration: "",
    instruction: "",
    notes: "",
  });
  const [medications, setMedications] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null); // Track if editing an existing medication
  const [isAdding, setIsAdding] = useState(false); // Track if we're adding a new prescription
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch existing prescriptions
    const fetchPrescription = async () => {
      console.log("Fetching prescription for appointmentId:", appointmentId); // Log the appointmentId
      try {
        const response = await axios.get(`${ip.address}/api/getfindings/${appointmentId}`);
        if (response.data && response.data.prescription) {
          console.log("Prescription found:", response.data.prescription);
          setMedications(response.data.prescription.medications);
        } else {
          console.log("No prescription found");
        }
      } catch (err) {
        console.log("Error fetching prescription:", err);
      }
    };

    fetchPrescription();
  }, [appointmentId]);

  const handleMedicationChange = (field, value) => {
    setMedication({ ...medication, [field]: value });
  };

  const addMedication = () => {
    if (medication.name && medication.type && medication.dosage && medication.frequency && medication.duration && medication.instruction) {
      if (editingIndex !== null) {
        // Update existing medication
        const updatedMedications = [...medications];
        updatedMedications[editingIndex] = medication;
        setMedications(updatedMedications);
        setEditingIndex(null);
      } else {
        // Add new medication
        setMedications((prevMedications) => [...prevMedications, medication]);
      }
      setMedication({
        name: "",
        type: "",
        dosage: "",
        frequency: "",
        duration: "",
        instruction: "",
        notes: "",
      });
      setError("");
    } else {
      setError("Please fill in all fields");
    }
  };

  const removeMedication = async (index) => {
    const newMedications = medications.filter((_, i) => i !== index);
    setMedications(newMedications);

    // Save after removal
    await handleSubmit();
  };

  const editMedication = (index) => {
    setMedication(medications[index]);
    setEditingIndex(index);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setMedication({
      name: "",
      type: "",
      dosage: "",
      frequency: "",
      duration: "",
      instruction: "",
      notes: "",
    });
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("patientId", patientId);
    formData.append("doctorId", doctorId);
    formData.append("appointmentId", appointmentId);
    formData.append("medications", JSON.stringify(medications));
  
    try {
      const response = await axios.post(
        `${ip.address}/api/doctor/api/createPrescription/${patientId}/${appointmentId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Prescription saved successfully!");
      console.log("Prescription saved:", response.data);
    } catch (err) {
      toast.error("Error saving prescription!");
      console.log("Error saving prescription:", err);
    }
  };

  const printPrescription = () => {
    const printWindow = window.open('hahaa', 'Molino Polyclinic');
    printWindow.document.write(`
      <html>
      <head>
        <title>Prescription</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          .container { width: 100%; margin: auto; padding: 10px; }
          .details { margin-bottom: 20px; }
          .details p { margin: 5px 0; }
          .table { width: 100%; border-collapse: collapse; }
          .table th, .table td { border: 1px solid black; padding: 8px; text-align: left; }
          .signature { margin-top: 40px; text-align: left; }
          .signature-line { display: inline-block; width: 209px; border-bottom: 1px solid black; margin-right: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Prescription</h1>

          <div class="details">
            <p><strong>Doctor:</strong> Dr. ${doctorId}</p>
            <p><strong>Appointment ID:</strong> ${appointmentId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Patient ID:</strong> ${patientId}</p>
          </div>

          <h3>Medications</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${medications.map((med) => `
                <tr>
                  <td>${med.name}</td>
                  <td>${med.type}</td>
                  <td>${med.dosage}</td>
                  <td>${med.frequency}</td>
                  <td>${med.duration}</td>
                  <td>${med.instruction}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Container fluid>
      <Row>
        <Col md={4}>
          <PrescriptionHistory pid={patientId} />
        </Col>
        <Col md={8}>

          <Card className="mb-4">
          <Card.Header>
            <h4 className="m-0 font-weight-bold text-gray">Prescription Preview</h4>
          </Card.Header>
          <Card.Body>
            <Table responsive striped variant="light" className="mt-3">
              <thead>
                <tr>
                  <th>Name of Drug</th>
                  <th>Type of Drug</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Instructions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medications.map((med, index) => (
                  <tr key={index}>
                    {editingIndex === index ? (
                      <>
                        <td><Form.Control type="text" value={medication.name} onChange={(e) => handleMedicationChange("name", e.target.value)} /></td>
                        <td><Form.Control type="text" value={medication.type} onChange={(e) => handleMedicationChange("type", e.target.value)} /></td>
                        <td><Form.Control type="text" value={medication.dosage} onChange={(e) => handleMedicationChange("dosage", e.target.value)} /></td>
                        <td><Form.Control type="text" value={medication.frequency} onChange={(e) => handleMedicationChange("frequency", e.target.value)} /></td>
                        <td><Form.Control type="text" value={medication.duration} onChange={(e) => handleMedicationChange("duration", e.target.value)} /></td>
                        <td><Form.Control type="text" value={medication.instruction} onChange={(e) => handleMedicationChange("instruction", e.target.value)} /></td>
                        <td>
                          <CheckCircle
                            onClick={addMedication}  // Handles both adding and saving to the backend
                            style={{ color: "green", cursor: "pointer" }}
                            title="Save"
                          />
                          <XCircle onClick={cancelEdit} style={{ color: "red", cursor: "pointer", marginLeft: "10px" }} title="Cancel" />
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{med.name}</td>
                        <td>{med.type}</td>
                        <td>{med.dosage}</td>
                        <td>{med.frequency}</td>
                        <td>{med.duration}</td>
                        <td>{med.instruction}</td>
                        <td>
                          <PencilSquare onClick={() => editMedication(index)} style={{ color: "blue", cursor: "pointer" }} title="Edit" />
                          <Trash onClick={() => removeMedication(index)} style={{ color: "red", cursor: "pointer", marginLeft: "10px" }} title="Delete" />
                        </td>
                      </>
                    )}
                  </tr>
                ))}

                {isAdding && (
                  <tr>
                    <td><Form.Control type="text" value={medication.name} onChange={(e) => handleMedicationChange("name", e.target.value)} /></td>
                    <td><Form.Control type="text" value={medication.type} onChange={(e) => handleMedicationChange("type", e.target.value)} /></td>
                    <td><Form.Control type="text" value={medication.dosage} onChange={(e) => handleMedicationChange("dosage", e.target.value)} /></td>
                    <td><Form.Control type="text" value={medication.frequency} onChange={(e) => handleMedicationChange("frequency", e.target.value)} /></td>
                    <td><Form.Control type="text" value={medication.duration} onChange={(e) => handleMedicationChange("duration", e.target.value)} /></td>
                    <td><Form.Control type="text" value={medication.instruction} onChange={(e) => handleMedicationChange("instruction", e.target.value)} /></td>
                    <td>
                      <CheckCircle
                        onClick={addMedication}  // Handles both adding and saving to the backend
                        style={{ color: "green", cursor: "pointer" }}
                        title="Save"
                      />
                      <XCircle onClick={() => setIsAdding(false)} style={{ color: "red", cursor: "pointer", marginLeft: "10px" }} title="Cancel" />
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            <div className="d-flex justify-content-between">
              {!isAdding && (
                <Button variant="primary" onClick={() => setIsAdding(true)}>
                  Add Medication
                </Button>
              )}

              {/* Save Prescription Button linked to handleSubmit */}
              <Button variant="success" onClick={handleSubmit}>
                Save Prescription
              </Button>

              <Button variant="success" onClick={printPrescription}>
                Print Prescription
              </Button>
            </div>

            {error && <p className="text-danger mt-2">{error}</p>}
          </Card.Body>
        </Card>
        </Col>
      </Row>
      
      <ToastContainer />

    </Container>
  );
}

export default Prescription;
