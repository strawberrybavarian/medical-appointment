import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col, Table, Container, Card } from "react-bootstrap";
import axios from "axios";
import "./PrescriptionStyle.css";
import { ip } from "../../../../ContentExport";

function Prescription({ patientId, appointmentId, doctorId }) {
  const [medication, setMedication] = useState({
    name: "",
    type: "",
    instruction: "",
  });
  const [medications, setMedications] = useState([]);
  const [rximage, setRximage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const response = await axios.get(
          `${ip.address}/doctor/api/getPrescription/${patientId}/${doctorId}`
        );
        if (response.data) {
          setMedications(response.data.medications);
        }
      } catch (err) {
        console.log("Error fetching prescription:", err);
      }
    };

    fetchPrescription();
  }, [patientId, doctorId]);

  const handleMedicationChange = (field, value) => {
    setMedication({ ...medication, [field]: value });
  };

  const addMedication = () => {
    if (medication.name && medication.type && medication.instruction) {
      setMedications((prevMedications) => [...prevMedications, medication]);
      setMedication({ name: "", type: "", instruction: "" });
      setError("");
    } else {
      setError("Please fill in all fields");
    }
  };

  const removeMedication = (index) => {
    const newMedications = medications.filter((_, i) => i !== index);
    setMedications(newMedications);
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
        `http://localhost:8000/doctor/api/createPrescription/${patientId}/${appointmentId}`,
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
        {/* Left Section - Form for adding medications */}
        <Col md={6}>
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
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Button variant="secondary" onClick={addMedication}>
                    Add Medication
                  </Button>
                </div>
                {error && <p className="text-danger mt-2">{error}</p>}
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Section - Medication Preview */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h4 className="m-0 font-weight-bold text-gray">Prescription Preview</h4>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Name of Drug</th>
                    <th>Type of Drug</th>
                    <th>Instructions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map((med, index) => (
                    <tr key={index}>
                      <td>{med.name}</td>
                      <td>{med.type}</td>
                      <td>{med.instruction}</td>
                      <td>
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
