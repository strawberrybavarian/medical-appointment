import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Navbar, Nav, Table, Form } from 'react-bootstrap';
import axios from "axios";
import { useEffect, useState } from "react";
import './PatientFindings.css';

function PatientFindings({ patientId, appointmentId, doctorId }) {
    // Patient Information State
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [age, setAge] = useState('');
    const [email, setEmail] = useState('');

    // Findings State
    const [findings, setFindings] = useState({
        bloodPressure: { systole: '', diastole: '' },
        respiratoryRate: '',
        pulseRate: '',
        temperature: '',
        weight: '',
        height: '',
        remarks: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get(`http://localhost:8000/patient/api/onepatient/${patientId}`)
            .then((res) => {
                setFname(res.data.thePatient.patient_firstName);
                setLname(res.data.thePatient.patient_lastName);
                setAge(res.data.thePatient.patient_age);
                setEmail(res.data.thePatient.patient_email);
            })
            .catch((err) => {
                console.log(err);
            });

        axios
            .get(`http://localhost:8000/api/getfindings/${appointmentId}`)
            .then((res) => {
                if (res.data) {
                    setFindings(res.data);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }, [patientId, appointmentId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'systole' || name === 'diastole') {
            setFindings((prevState) => ({
                ...prevState,
                bloodPressure: {
                    ...prevState.bloodPressure,
                    [name]: value
                }
            }));
        } else {
            setFindings((prevState) => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios
            .post('http://localhost:8000/createfindings', {
                ...findings,
                patient: patientId,
                appointment: appointmentId,
                doctor: doctorId
            })
            .then((res) => {
                console.log(res.data);
                alert('Findings saved successfully');
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <>
            <div className="pf-main">
                <h1>Patient Findings</h1>
                <div className="pf-container1">
                    <div className="pf-box1">
                        <div className="pf-boxtitle">
                            <div className="pf-title">
                                <h4>Patient Details</h4>
                            </div>
                        </div>
                        
                        <div className="pf-content">
                            <div className="pf-text">
                                <h6 style={{fontSize: 14, color: "GrayText"}}>Patient Name:</h6>
                                <p style={{fontSize: 18}}>{fname} {lname}</p>
                            </div>
                            <div className="pf-text">
                                <h6 style={{fontSize: 14, color: "GrayText"}}>Patient Age:</h6>
                                <p style={{fontSize: 18}}>{age}</p>
                            </div>
                            <div className="pf-text">
                                <h6 style={{fontSize: 14, color: "GrayText"}}>Patient Email:</h6>
                                <p style={{fontSize: 18}}>{email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pf-box2">
                        <div className="pf-boxtitle">
                            <div className="pf-title">
                                <h4>Patient Findings</h4>
                            </div>
                        </div>
                        <Form className="pf-content" onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Blood Pressure (Systole):</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="systole"
                                        value={findings.bloodPressure.systole}
                                        onChange={handleChange}
                                        style={{ fontSize: 18 }}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Blood Pressure (Diastole):</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="diastole"
                                        value={findings.bloodPressure.diastole}
                                        onChange={handleChange}
                                        style={{ fontSize: 18 }}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Respiratory Rate:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="respiratoryRate"
                                        value={findings.respiratoryRate}
                                        onChange={handleChange}
                                        style={{ fontSize: 18 }}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Pulse Rate:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="pulseRate"
                                        value={findings.pulseRate}
                                        onChange={handleChange}
                                        style={{ fontSize: 18 }}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Temperature:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="temperature"
                                        value={findings.temperature}
                                        onChange={handleChange}
                                        style={{ fontSize: 18 }}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Weight:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="weight"
                                        value={findings.weight}
                                        onChange={handleChange}
                                        style={{ fontSize: 18 }}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Height:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="height"
                                        value={findings.height}
                                        onChange={handleChange}
                                        style={{ fontSize: 18 }}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Remarks:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="remarks"
                                        value={findings.remarks}
                                        onChange={handleChange}
                                        style={{ fontSize: 18 }}
                                    />
                                </Form.Group>
                                <Button type="submit">Save Findings</Button>
                        </Form>
                            
                       
                    </div>
                </div>
            </div>
         
        </>
    );
}

export default PatientFindings;
