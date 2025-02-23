import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Button, Card, Collapse, Container, Table, Image, Row, Col } from 'react-bootstrap';
import { ip } from '../../../../ContentExport';

const PrescriptionHistory = ({ pid }) => {
  const [thePrescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState(null);
  const [openRecords, setOpenRecords] = useState({});

  useEffect(() => {
    axios.get(`${ip.address}/patient/api/onepatient/${pid}`)
      .then((res) => {
        if (res.data && res.data.thePatient && Array.isArray(res.data.thePatient.patient_appointments)) {
          setPrescriptions(res.data.thePatient.patient_appointments);
        } else {
          setPrescriptions([]);
        }
      })
      .catch((err) => {
        console.log(err);
        setError('Failed to fetch prescriptions');
        setPrescriptions([]);
      });
  }, [pid]);

  // Filter prescriptions that have medications or images and sort by date in descending order
  const sortedPrescriptions = [...thePrescriptions]
    .filter(prescription => (prescription.prescription && (prescription.prescription.medications.length > 0 || prescription.prescription.prescriptionImages.length > 0)))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const toggleCollapse = (id) => {
    setOpenRecords((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  return (
    <Container className="prescription-container mt-2">
      <h4 className="m-0 font-weight-bold text-gray">Past Prescriptions</h4>
      <hr />
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
              <p><strong>Doctor:</strong> {prescription.doctor.dr_firstName} {prescription.doctor.dr_lastName}</p>
              <p><strong>Date:</strong> {moment(prescription.date).format('MMMM Do YYYY')}</p>

              {/* Display Medications if they exist */}
              {prescription.prescription && prescription.prescription.medications.length > 0 && (
                <Container className='p-3'>
                  <h5>Medications</h5>
                  <Table responsive striped variant="light" className="mt-3">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Instruction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescription.prescription.medications.map((medication, idx) => (
                        <tr key={idx}>
                          <td>{medication.name}</td>
                          <td>{medication.type}</td>
                          <td>{medication.dosage}</td>
                          <td>{medication.frequency}</td>
                          <td>{medication.duration}</td>
                          <td>{medication.instruction}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Container>
              )}

              {/* Display Prescription Images if they exist */}
              {prescription.prescription && prescription.prescription.prescriptionImages.length > 0 && (
                <Container className='p-3'>
                  <h5>Prescription Images</h5>
                  <Row>
                    {prescription.prescription.prescriptionImages.map((imagePath, idx) => (
                      <Col key={idx} xs={6} md={4} lg={3} className="mb-3">
                        <Image
                          src={`${ip.address}/${imagePath}`}
                          thumbnail
                          alt={`Prescription Image ${idx + 1}`}
                        />
                      </Col>
                    ))}
                  </Row>
                </Container>
              )}
            </Card.Body>
          </Collapse>
        </Card>
      ))}
      {sortedPrescriptions.length === 0 && <p>No prescriptions found.</p>}
    </Container>
  );
};

export default PrescriptionHistory;