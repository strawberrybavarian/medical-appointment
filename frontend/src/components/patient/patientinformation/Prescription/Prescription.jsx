// Prescription.jsx

import React, { useState } from 'react';
import {
  Card,
  Collapse,
  Button,
  Container,
  Table,
  Image,
  Row,
  Col,
  Modal,
} from 'react-bootstrap';
import moment from 'moment';
import './Prescription.css'; // Import custom styling
import { ip } from '../../../../ContentExport'; // Import IP address

const Prescription = ({ prescriptions }) => {
  const [openRecords, setOpenRecords] = useState({}); // Track which records are open
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [selectedImage, setSelectedImage] = useState(''); // Selected image for modal

  // Filter prescriptions that have medications or images and sort by date descending
  const sortedPrescriptions = [...prescriptions]
    .filter(
      (prescription) =>
        prescription.prescription &&
        (prescription.prescription.medications.length > 0 ||
          (prescription.prescription.prescriptionImages &&
            prescription.prescription.prescriptionImages.length > 0))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Toggle collapse for each record
  const toggleCollapse = (id) => {
    setOpenRecords((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  // Handle image click to show modal
  const handleImageClick = (imagePath) => {
    setSelectedImage(`${ip.address}/${imagePath}`);
    setShowModal(true);
  };

  // Close the modal
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedImage('');
  };

  return (
    <Container className="prescription-container">
      <h1 className="my-4">Prescriptions</h1>
      {sortedPrescriptions.map((prescription) => (
        <Card key={prescription._id} className="mb-3 prescription-card">
          <Card.Header className="d-flex justify-content-between align-items-center prescription-header">
            <div className="prescription-date">
              {moment(prescription.createdAt).format('MMMM Do YYYY, h:mm a')}
            </div>
            <Button
              variant="link"
              onClick={() => toggleCollapse(prescription._id)}
              className="collapse-button"
            >
              {openRecords[prescription._id] ? '-' : '+'}
            </Button>
          </Card.Header>
          <Collapse in={openRecords[prescription._id]}>
            <Card.Body>
              <p>
                <strong>Doctor:</strong> {prescription.doctor.dr_firstName}{' '}
                {prescription.doctor.dr_lastName}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {moment(prescription.date).format('MMMM Do YYYY')}
              </p>

              <Container className="p-5">
                {/* Display Medications if they exist */}
                {prescription.prescription &&
                  prescription.prescription.medications.length > 0 && (
                    <Table
                      responsive
                      striped
                      variant="light"
                      className="mt-3"
                    >
                      <thead>
                        <tr>
                          <th>Medication</th>
                          <th>Type</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                          <th>Instruction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescription.prescription.medications.map(
                          (medication, idx) => (
                            <tr key={idx}>
                              <td>{medication.name}</td>
                              <td>{medication.type}</td>
                              <td>{medication.dosage}</td>
                              <td>{medication.frequency}</td>
                              <td>{medication.duration}</td>
                              <td>{medication.instruction}</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </Table>
                  )}

                {/* Display Prescription Images if they exist */}
                {prescription.prescription &&
                  prescription.prescription.prescriptionImages &&
                  prescription.prescription.prescriptionImages.length > 0 && (
                    <div className="prescription-images mt-4">
                      <h5>Prescription Images</h5>
                      <Row>
                        {prescription.prescription.prescriptionImages.map(
                          (imagePath, idx) => (
                            <Col
                              key={idx}
                              xs={6}
                              md={4}
                              lg={3}
                              className="mb-3"
                            >
                              <div
                                className="image-wrapper"
                                onClick={() => handleImageClick(imagePath)}
                                style={{ cursor: 'pointer' }}
                              >
                                <Image
                                  src={`${ip.address}/${imagePath}`}
                                  thumbnail
                                  alt={`Prescription Image ${idx + 1}`}
                                />
                              </div>
                            </Col>
                          )
                        )}
                      </Row>
                    </div>
                  )}
              </Container>
            </Card.Body>
          </Collapse>
        </Card>
      ))}
      {sortedPrescriptions.length === 0 && (
        <p>No prescriptions with medications found.</p>
      )}

      {/* Image Modal */}
      <Modal
        show={showModal}
        onHide={handleModalClose}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Prescription Image</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Image src={selectedImage} alt="Prescription" fluid />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" href={selectedImage} download>
            Download
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Prescription;