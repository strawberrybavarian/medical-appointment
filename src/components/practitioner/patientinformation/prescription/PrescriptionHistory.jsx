import  axios  from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Button, Card, Collapse, Container, Table } from 'react-bootstrap';

const PrescriptionHistory = ({pid}) => {
    const [thePrescriptions, setPrescriptions] = useState([]);
    const [error, setError] = useState(null);
    console.log('PrescriptionHistory',pid);
    useEffect(() => {
        axios.get(`http://localhost:8000/patient/api/onepatient/${pid}`)
            .then((res) => {
                console.log(res.data);  // Log the entire response to understand its structure
                if (res.data && res.data.thePatient && Array.isArray(res.data.thePatient.patient_appointments)) {
                    setPrescriptions(res.data.thePatient.patient_appointments);
                  
                } else {
                    setPrescriptions([]);
                  
                }
            })
            .catch((err) => {
                console.log(err);
                setError('Failed to fetch prescriptions');
                setPrescriptions([]);  // In case of error, set to empty array
            });
    }, [pid]);


    const [openRecords, setOpenRecords] = useState({}); // Track which records are open

    // Filter prescriptions that have medications and sort by date in descending order (recent first)
    const sortedPrescriptions = [...thePrescriptions]
        .filter(prescription => prescription.prescription && prescription.prescription.medications.length > 0)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Toggle the collapse for each record
    const toggleCollapse = (id) => {
        setOpenRecords((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };
    return (
        <Container className="prescription-container mt-2">
            <h4 className="m-0 font-weight-bold text-gray">Past Prescription</h4>
            <hr/>
            {sortedPrescriptions.map((prescription, index) => (
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
                            
                            <Container className='p-5'>
                            {prescription.prescription && prescription.prescription.medications.length > 0 && (
                                <Table responsive striped  variant="light" className="mt-3">
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
                            )}
                            </Container>
                        </Card.Body>
                    </Collapse>
                </Card>
            ))}
            {sortedPrescriptions.length === 0 && <p>No prescriptions with medications found.</p>}
        </Container>
    );
};

export default PrescriptionHistory;