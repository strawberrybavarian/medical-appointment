import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Card, Form } from 'react-bootstrap';
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
        <Container fluid>
            <Row className="mt-4">
                {/* Left Section with Two Smaller Cards */}
                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h4 className="m-0 font-weight-bold text-gray">Patient Details</h4>
                        </Card.Header>
                        <Card.Body>
                            <Card.Text>
                                <strong>Patient Name:</strong> {fname} {lname}
                            </Card.Text>
                            <Card.Text>
                                <strong>Patient Age:</strong> {age}
                            </Card.Text>
                            <Card.Text>
                                <strong>Patient Email:</strong> {email}
                            </Card.Text>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Header>
                            <h4 className="m-0 font-weight-bold text-gray">Preview Findings</h4>
                        </Card.Header>
                        <Card.Body>
                            <Card.Text>
                                <strong>Patient Name:</strong> {fname} {lname}
                            </Card.Text>
                            <Card.Text>
                                <strong>Patient Age:</strong> {age}
                            </Card.Text>
                            <Card.Text>
                                <strong>Patient Email:</strong> {email}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Section with the Larger Patient Findings Form */}
                <Col md={8}>
                    <Card className="mb-4">
                        <Card.Header className="d-flex align-items-center">
                            <h4 className="m-0 font-weight-bold text-gray">Patient Findings</h4>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Row className="mb-2">
                                    <Form.Group as={Col} className="mb-3">
                                        <Form.Label>Blood Pressure (Systole):</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="systole"
                                            value={findings.bloodPressure.systole}
                                            onChange={handleChange}
                                            style={{ fontSize: 18 }}
                                        />
                                    </Form.Group>
                                    <Form.Group as={Col} className="mb-3">
                                        <Form.Label>Blood Pressure (Diastole):</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="diastole"
                                            value={findings.bloodPressure.diastole}
                                            onChange={handleChange}
                                            style={{ fontSize: 18 }}
                                        />
                                    </Form.Group>
                                </Row>

                                <Row className="mb-2">
                                    <Form.Group as={Col} className="mb-3">
                                        <Form.Label>Respiratory Rate:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="respiratoryRate"
                                            value={findings.respiratoryRate}
                                            onChange={handleChange}
                                            style={{ fontSize: 18 }}
                                        />
                                    </Form.Group>
                                    <Form.Group as={Col} className="mb-3">
                                        <Form.Label>Pulse Rate:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="pulseRate"
                                            value={findings.pulseRate}
                                            onChange={handleChange}
                                            style={{ fontSize: 18 }}
                                        />
                                    </Form.Group>
                                    <Form.Group as={Col} className="mb-3">
                                        <Form.Label>Temperature:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="temperature"
                                            value={findings.temperature}
                                            onChange={handleChange}
                                            style={{ fontSize: 18 }}
                                        />
                                    </Form.Group>
                                </Row>

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
                                <Button type="submit" variant="primary">Save Findings</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default PatientFindings;
