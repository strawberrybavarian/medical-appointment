import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col, Table, Container, Card } from "react-bootstrap";
import axios from "axios";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
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

  const [doctorData, setDoctorData] = useState({
    theId: "",
    theName: "",
    theImage: "images/014ef2f860e8e56b27d4a3267e0a193a.jpg", 
    theLastName: "",
    theMI: "",
    email: "",
    cnumber: "",
    password: "",
    dob: "",
    specialty: ""
  });


  useEffect(() => {
    axios.get(`http://localhost:8000/doctor/api/finduser/${doctorId}`)
      .then((res) => {
        const data = res.data.theDoctor;
        setDoctorData({
          theId: data._id,
          theName: data.dr_firstName + data.dr_lastName,
          theImage: data.dr_image || doctorData.theImage,
          theLastName: data.dr_lastName,
          theMI: data.dr_middleInitial,
          email: data.dr_email,
          cnumber: data.dr_contactNumber,
          dob: data.dr_dob,
          password: data.dr_password,
          specialty: data.dr_specialty
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [doctorId]);

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

  const generatePDF = () => {
    const doc = new jsPDF();
  
    // Set prescription title
    doc.setFontSize(18);
    doc.text("Prescription", 90, 20); // Center-aligned title
    doc.setFontSize(12);
  
    // Doctor Information
    doc.text(`Doctor: Dr. ${doctorData.theName}`, 20, 30);
    doc.text(`Appointment ID: ${appointmentId}`, 20, 40);
  
    // Date and Patient Information
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text(`Patient ID: ${patientId}`, 20, 60);
  
    // Medication Information Table Heading
    doc.setFontSize(14);
    doc.text("Medications", 20, 70);
    doc.setFontSize(12);
  
    // Table Column Headers
    doc.text("Name", 20, 80);
    doc.text("Type", 50, 80);
    doc.text("Dosage", 80, 80);
    doc.text("Frequency", 110, 80);
    doc.text("Duration", 140, 80);
    doc.text("Instructions", 170, 80);
  
    // Draw Line Below Headers
    doc.line(20, 82, 200, 82);
  
    // Populate the medications in the PDF
    medications.forEach((med, index) => {
      const yPosition = 90 + index * 10;
      doc.text(med.name, 20, yPosition);
      doc.text(med.type, 50, yPosition);
      doc.text(med.dosage, 80, yPosition);
      doc.text(med.frequency, 110, yPosition);
      doc.text(med.duration, 140, yPosition);
      doc.text(med.instruction, 170, yPosition);
    });
  
    // If there is an attached prescription image, display the note
    if (rximage) {
      doc.text("Note: Attached prescription image.", 20, 130);
    }
  
    // Footer - Doctor Signature
    doc.line(150, 260, 200, 260); // Line for signature
    doc.text("Doctor's Signature", 155, 270);
  
    // Save the PDF
    doc.save("prescription.pdf");
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
          .signature-line1 { display: inline-block; width: 160px; border-bottom: 1px solid black; margin-right: 10px; }
          .signature-line2 { display: inline-block; width: 183px; border-bottom: 1px solid black; margin-right: 10px; }
          .signature-line3 { display: inline-block; width: 196px; border-bottom: 1px solid black; margin-right: 10px; }
          .license-container { display: flex; justify-content: end; }
          .license-section { text-align: right; width: 50%; }
          .signature-section { text-align: right; width: 50%; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Prescription</h1>
  
          <div class="details">
            <p><strong>Doctor:</strong> Dr. ${doctorData.theName}</p>
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
  
          ${rximage ? `<p><strong>Note:</strong> Attached prescription image.</p>` : ''}
  
          <div class="license-container">
          
              
          
            <div class="license-section">
            <div class="license-container">
              <div>
              <p><span class="signature-line"></span>, M.D.</p>
              <p>License No.: <span class="signature-line1"></span></p>
              <p>PTR No.: <span class="signature-line2"></span></p>
              <p>S2 No.: <span class="signature-line3"></span></p>
              <div>

            
            </div>
              
            </div>
          </div>


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
              <div id="prescription-table">
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
              </div>

              {/* <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Upload Prescription Image</Form.Label>
                <Form.Control type="file" onChange={handleImageChange} />
              </Form.Group> */}

              <div className="d-flex justify-content-between">
                <Button variant="primary" onClick={handleSubmit}>
                  Save Prescription
                </Button>
            
                <Button variant="success" onClick={printPrescription}>
                  Print
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Prescription;
