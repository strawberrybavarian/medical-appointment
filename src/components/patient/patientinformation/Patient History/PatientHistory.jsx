import React, { useState } from 'react';
import { Card, Collapse, Button, Container } from 'react-bootstrap';
import moment from 'moment';

const PatientHistory = ({ patientHistory }) => {
    const [openRecords, setOpenRecords] = useState({}); // Track which records are open

    // Sort the history by date in descending order (recent first)
    const sortedHistory = [...patientHistory].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Toggle the collapse for each record
    const toggleCollapse = (id) => {
        setOpenRecords((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    return (
        <Container>
            <h1 className="my-4">Patient History</h1>
            {sortedHistory.map((record) => (
                <Card key={record._id} className="mb-3">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <div>{moment(record.createdAt).format('MMMM Do YYYY, h:mm a')}</div>
                        <Button
                            variant="link"
                            onClick={() => toggleCollapse(record._id)}
                            className="link-collapse"
                        >
                            {openRecords[record._id] ? <span>&#8722;</span> : <span>&#43;</span>}
                        </Button>
                    </Card.Header>
                    <Collapse in={openRecords[record._id]}>
                        <Card.Body>
                            <p><strong>Appointment ID:</strong> {record.appointment}</p>
                            <p><strong>Doctor ID:</strong> {record.doctor}</p>
                            <p><strong>Blood Pressure:</strong> {`${record.bloodPressure.systole}/${record.bloodPressure.diastole}`}</p>
                            <p><strong>Pulse Rate:</strong> {record.pulseRate}</p>
                            <p><strong>Respiratory Rate:</strong> {record.respiratoryRate}</p>
                            <p><strong>Temperature:</strong> {record.temperature}</p>
                            <p><strong>Height:</strong> {record.height}</p>
                            <p><strong>Weight:</strong> {record.weight}</p>
                            <p><strong>History of Present Illness:</strong> {record.historyOfPresentIllness.currentSymptoms.length > 0 ? record.historyOfPresentIllness.currentSymptoms.join(", ") : "None"}</p>
                            <p><strong>Lifestyle (Smoking):</strong> {record.lifestyle.smoking ? 'Yes' : 'No'}</p>
                            <p><strong>Lifestyle (Alcohol Consumption):</strong> {record.lifestyle.alcoholConsumption ? 'Yes' : 'No'}</p>
                            <p><strong>Social Support:</strong> {record.socialHistory.socialSupport ? 'Yes' : 'No'}</p>
                            <p><strong>Remarks:</strong> {record.remarks}</p>
                        </Card.Body>
                    </Collapse>
                </Card>
            ))}
        </Container>
    );
};

export default PatientHistory;
