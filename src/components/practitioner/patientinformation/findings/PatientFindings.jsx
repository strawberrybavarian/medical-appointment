import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Card, Form, Table } from 'react-bootstrap';
import axios from "axios";
import { useEffect, useState } from "react";
import './PatientFindings.css'; 

function PatientFindings({ patientId, appointmentId, doctorId }) {
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


    

    const [loading, setLoading] = useState(true);  // Loading state for data fetching
    const [error, setError] = useState(null);      // Error state for data fetching

    const navigate = useNavigate();

    // Fetching patient data and findings when the component loads
    useEffect(() => {
        const fetchPatientAndFindings = async () => {
            setLoading(true);
            try {
                // Fetch patient details
                const patientRes = await axios.get(`http://localhost:8000/patient/api/onepatient/${patientId}`);
                setFname(patientRes.data.thePatient.patient_firstName);
                setLname(patientRes.data.thePatient.patient_lastName);
                setAge(patientRes.data.thePatient.patient_age);
                setEmail(patientRes.data.thePatient.patient_email);
    
                // Fetch findings for the appointment
                const findingsRes = await axios.get(`http://localhost:8000/getfindings/${appointmentId}`);
                console.log('Findings Response:', findingsRes.data);  // Debug log
    
                // Correct data structure check
                if (findingsRes.data && findingsRes.data.findings) {
                    setFindings(findingsRes.data.findings);
                } else {
                    console.warn("No findings data returned for this appointmentId.");
                }
    
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data. Please try again later.');
                setLoading(false);
            }
        };
    
        fetchPatientAndFindings();
    }, [patientId, appointmentId]);
    

    // Handle field changes in the form
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

    // Handle saving updates from the form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Save or update findings
            await axios.post('http://localhost:8000/createfindings', {
                ...findings,
                patient: patientId,
                appointment: appointmentId,
                doctor: doctorId
            });
            alert('Findings saved successfully');
        } catch (err) {
            console.error('Error saving findings:', err);
            alert('Error saving findings');
        }
    };

    // Display loading or error message
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

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
                        <Table striped bordered hover>
    <tbody>
        <tr>
            <td>Blood Pressure</td>
            <td>{findings?.bloodPressure?.systole || 'N/A'}/{findings?.bloodPressure?.diastole || 'N/A'}</td>
        </tr>
        <tr>
            <td>Respiratory Rate</td>
            <td>{findings?.respiratoryRate || 'N/A'}</td>
        </tr>
        <tr>
            <td>Pulse Rate</td>
            <td>{findings?.pulseRate || 'N/A'}</td>
        </tr>
        <tr>
            <td>Temperature (°C) </td>
            <td>{findings?.temperature || 'N/A'}</td>
        </tr>
        <tr>
            <td>Weight</td>
            <td>{findings?.weight || 'N/A'}</td>
        </tr>
        <tr>
            <td>Height</td>
            <td>{findings?.height || 'N/A'}</td>
        </tr>
        <tr>
            <td>Remarks</td>
            <td>{findings?.remarks || 'N/A'}</td>
        </tr>
    </tbody>
</Table>
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
                                        value={findings?.bloodPressure?.systole || ''}
                                        onChange={handleChange}
                                        style={{ fontSize: 18 }}
                                        />


                                    </Form.Group>
                                    <Form.Group as={Col} className="mb-3">
                                        <Form.Label>Blood Pressure (Diastole):</Form.Label>
                                        
                                        <Form.Control
                                            type="number"
                                            name="diastole"
                                            value={findings?.bloodPressure?.diastole || ''}
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
                                            value={findings.respiratoryRate || ''}
                                            onChange={handleChange}
                                            style={{ fontSize: 18 }}
                                        />
                                    </Form.Group>
                                    <Form.Group as={Col} className="mb-3">
                                        <Form.Label>Pulse Rate:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="pulseRate"
                                            value={findings.pulseRate || ''}
                                            onChange={handleChange}
                                            style={{ fontSize: 18 }}
                                        />
                                    </Form.Group>
                                    <Form.Group as={Col} className="mb-3">
                                        <Form.Label>Temperature :</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="temperature"
                                            value={findings.temperature || ''}
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
                                        value={findings.weight || ''}
                                        onChange={handleChange}
                                        style={{ fontSize: 18 }}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Height:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="height"
                                        value={findings.height || ''}
                                        onChange={handleChange}
                                        style={{ fontSize: 18 }}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Remarks:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="remarks"
                                        value={findings.remarks || ''}
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
