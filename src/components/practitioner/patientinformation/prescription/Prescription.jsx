import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col, Table, Container, Card } from "react-bootstrap";
import axios from "axios";
import "./PrescriptionStyle.css";
import { ip } from "../../../../ContentExport";

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
  const [rximage, setRximage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const medicationRes = await axios.get(`${ip.address}/getfindings/${appointmentId}`);
        if (medicationRes.data.prescription) {
          setMedications(medicationRes.data.prescription.medications); // Assuming response contains medication list
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

  const removeMedication = (index) => {
    const newMedications = medications.filter((_, i) => i !== index);
    setMedications(newMedications);
  };

  const editMedication = (index) => {
    setMedication(medications[index]);
    setEditingIndex(index);
  };

  const handleImageChange = (e) => {
    setRximage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("patientId", patientId);
    formData.append("doctorId", doctorId);
    formData.append("appointmentId", appointmentId);
    formData.append("medications", JSON.stringify(medications));
    if (rximage) {
      formData.append("image", rximage);
    }

    try {
      const response = await axios.post(
        `${ip.address}/doctor/api/createPrescription/${patientId}/${appointmentId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      window.alert("Prescription saved successfully!");
      console.log(response.data);
    } catch (err) {
      console.log(err);
      setError("Error saving prescription");
    }
  };

  return (
    <Container fluid>
      <Row className="mt-4">
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h4 className="m-0 font-weight-bold text-gray">Add Medication</h4>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Name of Drug</Form.Label>
                      <Form.Control
                        type="text"
                        value={medication.name}
                        onChange={(e) =>
                          handleMedicationChange("name", e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Type of Drug</Form.Label>
                      <Form.Control
                        type="text"
                        value={medication.type}
                        onChange={(e) =>
                          handleMedicationChange("type", e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Dosage</Form.Label>
                      <Form.Control
                        type="text"
                        value={medication.dosage}
                        onChange={(e) =>
                          handleMedicationChange("dosage", e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Frequency</Form.Label>
                      <Form.Control
                        type="text"
                        value={medication.frequency}
                        onChange={(e) =>
                          handleMedicationChange("frequency", e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Duration</Form.Label>
                      <Form.Control
                        type="text"
                        value={medication.duration}
                        onChange={(e) =>
                          handleMedicationChange("duration", e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Instructions</Form.Label>
                      <Form.Control
                        type="text"
                        value={medication.instruction}
                        onChange={(e) =>
                          handleMedicationChange("instruction", e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Notes (optional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={medication.notes}
                    onChange={(e) =>
                      handleMedicationChange("notes", e.target.value)
                    }
                  />
                </Form.Group>

                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Button variant="secondary" onClick={addMedication}>
                    {editingIndex !== null ? "Update Medication" : "Add Medication"}
                  </Button>
                </div>
                {error && <p className="text-danger mt-2">{error}</p>}
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h4 className="m-0 font-weight-bold text-gray">Prescription Preview</h4>
            </Card.Header>
            <Card.Body>
              <Table responsive striped bordered hover>
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
                      <td>{med.name}</td>
                      <td>{med.type}</td>
                      <td>{med.dosage}</td>
                      <td>{med.frequency}</td>
                      <td>{med.duration}</td>
                      <td>{med.instruction}</td>
                      <td>
                        <Button variant="warning" onClick={() => editMedication(index)}>
                          Edit
                        </Button>{" "}
                        <Button
                          variant="danger"
                          onClick={() => removeMedication(index)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Upload Prescription Image</Form.Label>
                <Form.Control type="file" onChange={handleImageChange} />
              </Form.Group>

              <Button variant="primary" onClick={handleSubmit}>
                Save Prescription
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Prescription;
