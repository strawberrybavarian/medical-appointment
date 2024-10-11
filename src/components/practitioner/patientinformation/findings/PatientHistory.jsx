import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Collapse, Container, Card, Button } from 'react-bootstrap';

const PatientHistory = ({pid}) => {
    
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);
    
    const [openRecords, setOpenRecords] = useState({}); // Track which records are open
    useEffect(() => {
        axios.get(`http://localhost:8000/patient/api/onepatient/${pid}`)
            .then((res) => {
                console.log(res.data);  // Log the entire response to understand its structure
                if (res.data && res.data.thePatient && Array.isArray(res.data.thePatient.patient_appointments)) {
                    // setPrescriptions(res.data.thePatient.patient_appointments);
                    setHistory(res.data.thePatient.patient_findings);
                    // setImmunization(res.data.thePatient.immunizations);
                } else {
                    // setPrescriptions([]);
                    setHistory([]);  // If data is not as expected, set to empty array
                }
            })
            .catch((err) => {
                console.log(err);
                setError('Failed to fetch prescriptions');
                // setPrescriptions([]);  // In case of error, set to empty array
            });
    }, [pid]);


    // Sort the history by date in descending order (recent first)
    const sortedHistory = [...history].sort(
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
            <h4 className="m-0 font-weight-bold text-gray">Patient History</h4>
            <hr/>
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
                        {record?.appointment && (
    <>

        <p><strong>Appointment Date:</strong> {moment(record.appointment.date).format('MMMM Do YYYY')}</p>
        <p><strong>Appointment Time:</strong> {record.appointment.time}</p>
    </>
)}

                            {record?.doctor && (
                                        <>
                                            <p><strong>Doctor Name:</strong> {`${record.doctor.dr_firstName} ${record.doctor.dr_lastName}`}</p>
                                            <p><strong>Doctor Email:</strong> {record.doctor.dr_email}</p>
                                        </>
                                    )}

                            <p><strong>Blood Pressure:</strong> {`${record?.bloodPressure.systole}/${record.bloodPressure.diastole}`}</p>
                            <p><strong>Pulse Rate:</strong> {record?.pulseRate}</p>
                            <p><strong>Respiratory Rate:</strong> {record?.respiratoryRate}</p>
                            <p><strong>Temperature:</strong> {record?.temperature}</p>
                            <p><strong>Height:</strong> {record?.height}</p>
                            <p><strong>Weight:</strong> {record?.weight}</p>
                            <p><strong>History of Present Illness:</strong> {record?.historyOfPresentIllness.currentSymptoms.length > 0 ? record.historyOfPresentIllness.currentSymptoms.join(", ") : "None"}</p>
                            <p><strong>Lifestyle (Smoking):</strong> {record?.lifestyle.smoking ? 'Yes' : 'No'}</p>
                            <p><strong>Lifestyle (Alcohol Consumption):</strong> {record?.lifestyle.alcoholConsumption ? 'Yes' : 'No'}</p>
                            <p><strong>Social Support:</strong> {record?.socialHistory.socialSupport ? 'Yes' : 'No'}</p>
                            <p><strong>Remarks:</strong> {record?.remarks}</p>
                        </Card.Body>
                    </Collapse>
                </Card>
            ))}
        </Container>
    );
};

export default PatientHistory;