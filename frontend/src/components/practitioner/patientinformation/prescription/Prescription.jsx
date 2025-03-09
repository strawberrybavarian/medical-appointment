import React, { useState, useEffect, useCallback } from "react";
import { Button, Form, Table, Container, Card, Row, Col, Spinner, Badge } from "react-bootstrap";
import { PencilSquare, Trash, CheckCircle, XCircle, CloudCheck, PlusCircle, Printer, FileMedical } from 'react-bootstrap-icons';
import axios from "axios";
import { ip } from "../../../../ContentExport";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrescriptionHistory from "./PrescriptionHistory";
import ImagePrescriptionUpload from "./ImagePrescriptionUpload";
import { debounce } from 'lodash';

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
  const [editingIndex, setEditingIndex] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [prescriptionImages, setPrescriptionImages] = useState([]);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle, saving, saved, error
  
  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const response = await axios.get(`${ip.address}/api/getfindings/${appointmentId}`);
        if (response.data && response.data.prescription) {
          setMedications(response.data.prescription.medications);
          setPrescriptionImages(response.data.prescription.prescriptionImages || []);
        }
      } catch (err) {
        console.log("Error fetching prescription:", err);
      }
    };
    fetchPrescription();
  }, [appointmentId]);

  // Create a debounced version of the save function
  const debouncedSave = useCallback(
    debounce(async (medsToSave, imagesToSave) => {
      setSaveStatus("saving");
      
      const formData = new FormData();
      formData.append("patientId", patientId);
      formData.append("doctorId", doctorId);
      formData.append("appointmentId", appointmentId);
      formData.append("medications", JSON.stringify(medsToSave));
      
      imagesToSave.forEach((image, index) => {
        if (image.file) {
          formData.append("images", image.file);
        }
      });
      
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
        setSaveStatus("saved");
        
        setTimeout(() => {
          setSaveStatus("idle");
        }, 3000);
      } catch (err) {
        setSaveStatus("error");
        toast.error("Error auto-saving prescription");
      }
    }, 800),
    [patientId, appointmentId, doctorId]
  );

  // Auto-save whenever medications change
  useEffect(() => {
    if (medications.length > 0) {
      debouncedSave(medications, prescriptionImages);
    }
  }, [medications, debouncedSave]);
  
  // Auto-save when images change
  useEffect(() => {
    if (prescriptionImages.length > 0) {
      debouncedSave(medications, prescriptionImages);
    }
  }, [prescriptionImages, debouncedSave]);

  const handleMedicationChange = (field, value) => {
    setMedication({ ...medication, [field]: value });
  };

  const addMedication = () => {
    if (medication.name && medication.type && medication.dosage && medication.frequency && medication.duration && medication.instruction) {
      if (editingIndex !== null) {
        const updatedMedications = [...medications];
        updatedMedications[editingIndex] = medication;
        setMedications(updatedMedications);
        setEditingIndex(null);
      } else {
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
      setIsAdding(false);
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

  const printPrescription = async () => {
    try {
      // Fetch full patient information
      const patientResponse = await axios.get(`${ip.address}/api/patient/api/onepatient/${patientId}`);
      const patient = patientResponse.data.thePatient;
      const patientFullName = `${patient.patient_firstName} ${patient.patient_middleInitial || ''} ${patient.patient_lastName}`;
      
      // Fetch full doctor information
      const doctorResponse = await axios.get(`${ip.address}/api/doctor/${doctorId}`);
      const doctor = doctorResponse.data.doctor;
      const doctorFullName = `${doctor.dr_firstName} ${doctor.dr_middleInitial || ''} ${doctor.dr_lastName}`;
      const doctorLicenseNo = doctor.dr_licenseNo || "MD-XXXXX";
      const doctorSpecialty = doctor.dr_specialty || "Medical Doctor";
      
      const appointmentResponse = await axios.get(`${ip.address}/api/appointments/${appointmentId}`);
      const appointment = appointmentResponse.data;

      // Get current date in a nicer format
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
  
      const printWindow = window.open('', 'Molino Polyclinic');
      printWindow.document.write(`
        <html>
        <head>
          <title>Prescription</title>
          <style>
            @page {
              size: 8.5in 11in;
              margin: 0.5in;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              padding: 0;
              margin: 0;
              color: #333;
              line-height: 1.5;
            }
            .prescription {
              max-width: 750px;
              margin: 0 auto;
              padding: 20px;
              border: 2px solid #093c7c;
              border-radius: 5px;
              background-color: #fff;
              position: relative;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #093c7c;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .clinic-name {
              font-size: 24px;
              font-weight: bold;
              color: #093c7c;
              margin: 0;
            }
            .clinic-address {
              font-size: 14px;
              margin: 5px 0;
            }
            .clinic-contact {
              font-size: 14px;
              margin: 5px 0;
            }
            .rx-symbol {
              font-size: 36px;
              float: left;
              margin-right: 10px;
              color: #093c7c;
              font-weight: bold;
            }
            .patient-info {
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
              margin-bottom: 30px;
              border-bottom: 1px dashed #ccc;
              padding-bottom: 10px;
            }
            .patient-info div {
              flex: 1;
              min-width: 200px;
              margin-bottom: 10px;
            }
            .patient-label {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .patient-value {
              margin: 0;
            }
            .medication-list {
              margin: 20px 0 30px 40px;
            }
            .medication-item {
              margin-bottom: 20px;
              position: relative;
              padding-left: 15px;
            }
            .medication-item:before {
              content: "•";
              position: absolute;
              left: 0;
              color: #093c7c;
              font-size: 20px;
            }
            .med-name {
              font-weight: bold;
              font-size: 16px;
            }
            .med-details {
              margin-top: 5px;
              font-style: italic;
            }
            .med-instruction {
              margin-top: 5px;
            }
            .footer {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
            }
            .signature-area {
              width: 250px;
              text-align: center;
            }
            .signature-line {
              border-bottom: 1px solid #000;
              margin-bottom: 5px;
              height: 40px;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 100px;
              color: rgba(9, 60, 124, 0.05);
              z-index: -1;
              white-space: nowrap;
            }
          </style>
        </head>
        <body>
          <div class="prescription">
            <div class="watermark">MOLINO POLYCLINIC</div>
            <div class="header">
              <p class="clinic-name">MOLINO POLYCLINIC</p>
              <p class="clinic-address">123 Healthcare Avenue, Molino, Bacoor City</p>
              <p class="clinic-contact">Tel: (046) 123-4567 | Email: info@molinopolyclinic.com</p>
            </div>
            
            <div class="patient-info">
              <div>
                <p class="patient-label">Patient Name:</p>
                <p class="patient-value">${patientFullName}</p>
              </div>
              <div>
                <p class="patient-label">Date:</p>
                <p class="patient-value">${formattedDate}</p>
              </div>
              <div>
                <p class="patient-label">Appointment ID:</p>
                <p class="patient-value">${appointment.appointment_ID}</p>
              </div>
            </div>
            
            <div class="rx-symbol">Rx</div>
            <div class="medication-list">
              ${medications.map((med) => `
                <div class="medication-item">
                  <div class="med-name">${med.name} (${med.type})</div>
                  <div class="med-details">
                    ${med.dosage}, ${med.frequency} for ${med.duration}
                  </div>
                  <div class="med-instruction">
                    <em>Instructions: ${med.instruction}</em>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="footer">
              <div></div>
              <div class="signature-area">
                <div class="signature-line"></div>
                <div>Dr. ${doctorFullName}</div>
                <div>${doctorSpecialty}</div>
                <div>License #: ${doctorLicenseNo}</div>
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
    } catch (error) {
      console.error("Error generating prescription:", error);
      toast.error("Error generating prescription");
    }
  };

  // Render save status indicator
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <div className="save-indicator saving">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Saving...</span>
          </div>
        );
      case "saved":
        return (
          <div className="save-indicator saved">
            <CloudCheck size={18} className="me-2" />
            <span>All changes saved</span>
          </div>
        );
      case "error":
        return (
          <div className="save-indicator error">
            <XCircle size={18} className="me-2" />
            <span>Error saving changes</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={4}>
          <PrescriptionHistory pid={patientId} />
        </Col>
        <Col md={8}>
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="d-flex justify-content-between align-items-center bg-white py-3 border-bottom border-2">
              <div className="d-flex align-items-center">
                <FileMedical size={24} className="text-primary me-2" />
                <h4 className="m-0 fw-bold">Prescription</h4>
              </div>
              {renderSaveStatus()}
            </Card.Header>
            
            <Card.Body className="p-4">
              {medications.length > 0 ? (
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-3">
                    <h5 className="fw-bold">Current Medications</h5>
                    <Badge bg="primary" className="align-self-start rounded-pill">
                      {medications.length} {medications.length === 1 ? 'medication' : 'medications'}
                    </Badge>
                  </div>
                  
                  <div className="table-responsive">
                    <Table hover className="medication-table">
                      <thead className="table-light">
                        <tr>
                          <th width="18%">Name</th>
                          <th width="12%">Type</th>
                          <th width="15%">Dosage</th>
                          <th width="15%">Frequency</th>
                          <th width="15%">Duration</th>
                          <th width="15%">Instructions</th>
                          <th width="10%" className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medications.map((med, index) => (
                          <tr key={index} className={editingIndex === index ? "table-active" : ""}>
                            {editingIndex === index ? (
                              <>
                                <td><Form.Control size="sm" type="text" value={medication.name} onChange={(e) => handleMedicationChange("name", e.target.value)} /></td>
                                <td><Form.Control size="sm" type="text" value={medication.type} onChange={(e) => handleMedicationChange("type", e.target.value)} /></td>
                                <td><Form.Control size="sm" type="text" value={medication.dosage} onChange={(e) => handleMedicationChange("dosage", e.target.value)} /></td>
                                <td><Form.Control size="sm" type="text" value={medication.frequency} onChange={(e) => handleMedicationChange("frequency", e.target.value)} /></td>
                                <td><Form.Control size="sm" type="text" value={medication.duration} onChange={(e) => handleMedicationChange("duration", e.target.value)} /></td>
                                <td><Form.Control size="sm" type="text" value={medication.instruction} onChange={(e) => handleMedicationChange("instruction", e.target.value)} /></td>
                                <td className="text-center">
                                  <Button variant="success" size="sm" className="me-1" onClick={addMedication} title="Save">
                                    <CheckCircle size={14} />
                                  </Button>
                                  <Button variant="outline-danger" size="sm" onClick={cancelEdit} title="Cancel">
                                    <XCircle size={14} />
                                  </Button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="fw-medium">{med.name}</td>
                                <td><Badge bg="light" text="dark" className="rounded-pill">{med.type}</Badge></td>
                                <td>{med.dosage}</td>
                                <td>{med.frequency}</td>
                                <td>{med.duration}</td>
                                <td><small>{med.instruction}</small></td>
                                <td className="text-center">
                                  <Button variant="outline-primary" size="sm" className="me-1 p-1" onClick={() => editMedication(index)} title="Edit">
                                    <PencilSquare size={14} />
                                  </Button>
                                  <Button variant="outline-danger" size="sm" className="p-1" onClick={() => removeMedication(index)} title="Delete">
                                    <Trash size={14} />
                                  </Button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              ) : (
                !isAdding && (
                  <div className="text-center py-5 mb-4 border border-dashed rounded bg-light">
                    <p className="text-muted mb-2">No medications added yet</p>
                    <Button 
                      variant="outline-primary" 
                      onClick={() => setIsAdding(true)}
                      className="d-inline-flex align-items-center"
                    >
                      <PlusCircle className="me-2" /> Add Your First Medication
                    </Button>
                  </div>
                )
              )}
              
              {isAdding && (
                <Card className="mb-4 shadow-sm border-primary border-start border-2">
                  <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Add New Medication</h5>
                    <Button variant="outline-danger" size="sm" onClick={() => setIsAdding(false)}>
                      Cancel
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Name of Drug*</Form.Label>
                          <Form.Control type="text" value={medication.name} onChange={(e) => handleMedicationChange("name", e.target.value)} placeholder="Enter medication name" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Type of Drug*</Form.Label>
                          <Form.Control type="text" value={medication.type} onChange={(e) => handleMedicationChange("type", e.target.value)} placeholder="e.g. Antibiotic, Analgesic" />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Dosage*</Form.Label>
                          <Form.Control type="text" value={medication.dosage} onChange={(e) => handleMedicationChange("dosage", e.target.value)} placeholder="e.g. 500mg" />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Frequency*</Form.Label>
                          <Form.Control type="text" value={medication.frequency} onChange={(e) => handleMedicationChange("frequency", e.target.value)} placeholder="e.g. 3x daily" />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Duration*</Form.Label>
                          <Form.Control type="text" value={medication.duration} onChange={(e) => handleMedicationChange("duration", e.target.value)} placeholder="e.g. 7 days" />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Instructions*</Form.Label>
                          <Form.Control type="text" value={medication.instruction} onChange={(e) => handleMedicationChange("instruction", e.target.value)} placeholder="e.g. Take after meals" />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Notes (Optional)</Form.Label>
                          <Form.Control 
                            as="textarea" 
                            rows={2} 
                            value={medication.notes} 
                            onChange={(e) => handleMedicationChange("notes", e.target.value)}
                            placeholder="Any additional notes or special instructions" 
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    {error && <p className="text-danger">{error}</p>}
                    <div className="d-flex justify-content-end mt-3">
                      <Button variant="primary" onClick={addMedication}>
                        {editingIndex !== null ? 'Update Medication' : 'Add to Prescription'}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}
              
              <div className="d-flex justify-content-between mb-4">
                {!isAdding && medications.length > 0 && (
                  <Button 
                    variant="outline-primary" 
                    onClick={() => setIsAdding(true)}
                    className="d-inline-flex align-items-center"
                  >
                    <PlusCircle className="me-2" /> Add Medication
                  </Button>
                )}
                
                {medications.length > 0 && (
                  <Button 
                    variant="success" 
                    onClick={printPrescription}
                    className="d-inline-flex align-items-center ms-auto"
                  >
                    <Printer className="me-2" /> Print Prescription
                  </Button>
                )}
              </div>
              
              <hr className="my-4" />
              
              <h5 className="mb-3 fw-bold">Prescription Images (Optional) </h5>
              <ImagePrescriptionUpload
                prescriptionImages={prescriptionImages}
                setPrescriptionImages={setPrescriptionImages}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <ToastContainer />
      
      <style jsx>{`
        .save-indicator {
          display: flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          animation: fadeIn 0.3s ease;
          transition: opacity 0.5s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.08);
        }

        .save-indicator.saving {
          background-color: #e9ecef;
          color: #495057;
        }

        .save-indicator.saved {
          background-color: #d1e7dd;
          color: #0f5132;
          animation: fadeInOut 3s ease;
        }

        .save-indicator.error {
          background-color: #f8d7da;
          color: #842029;
        }
        
        .medication-table {
          border-collapse: separate;
          border-spacing: 0;
        }
        
        .medication-table thead th {
          border-top: none;
          border-bottom: 2px solid #dee2e6;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          color: #495057;
        }
        
        .medication-table tbody tr {
          transition: all 0.2s;
        }
        
        .medication-table tbody tr:hover {
          background-color: rgba(13, 110, 253, 0.04);
        }
        
        .table-active {
          background-color: rgba(13, 110, 253, 0.08) !important;
        }
        
        .border-dashed {
          border-style: dashed !important;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </Container>
  );
}

export default Prescription;