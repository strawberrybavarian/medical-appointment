import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Card, Table, Button } from 'react-bootstrap';
import ForPrescription from './ForPrescription';
import { ip } from '../../../ContentExport';

const PatientRecord = ({ patientId, onClose }) => {
    const [patient, setPatient] = useState(null);

    useEffect(() => {
        axios
            .get(`${ip.address}/api/patient/api/onepatient/${patientId}`)
            .then((res) => {
                console.log(res.data.thePatient);
                setPatient(res.data.thePatient);
            })
            .catch((err) => {
                console.error('Error fetching patient data:', err);
            });
    }, [patientId]);

    if (!patient) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: "20px", overflowY: "auto", overflowX: "hidden" }} className="container1 container-fluid">
        <div className="container mt-5">
            <Button variant="secondary" onClick={onClose}>Back to Medical Records</Button>
            <h1 className="text-center mb-4">Patient Record</h1>
            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>Personal Information</Card.Title>
                    <p><strong>ID:</strong> {patient.patient_ID}</p>
                    <p><strong>Name:</strong> {patient.patient_firstName} {patient.patient_middleInitial}. {patient.patient_lastName}</p>
                    <p><strong>Email:</strong> {patient.patient_email}</p>
                    <p><strong>Age:</strong> {patient.patient_age}</p>
                    <p><strong>Contact Number:</strong> {patient.patient_contactNumber}</p>
                    <p><strong>Gender:</strong> {patient.patient_gender}</p>
                </Card.Body>
            </Card>


            <ForPrescription patient={patient}/>
        </div>
        </div>
    );
};

export default PatientRecord;
