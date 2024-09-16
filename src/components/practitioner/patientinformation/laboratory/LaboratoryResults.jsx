import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Container } from 'react-bootstrap';
import axios from 'axios';

function LaboratoryResults({ patientId, appointmentId, doctorId }) {
    const [formData, setFormData] = useState({
        interpretation: '',
        recommendations: '',
        testResults: [],
        file: null
    });
    const [newTestResult, setNewTestResult] = useState({
        name: '',
        value: '',
        unit: '',
        lower: '',
        upper: '',
        status: 'Normal',
        notes: ''
    });
    const [labResults, setLabResults] = useState([]);
    const [error, setError] = useState(null);

    // Fetch laboratory results for the patient
    useEffect(() => {
        const fetchLabResults = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/patient/${patientId}/appointments/${appointmentId}/labResults`);
                setLabResults(response.data);
            } catch (err) {
                setError('Failed to fetch laboratory results');
            }
        };
        fetchLabResults();
    }, [patientId, appointmentId]);

    // Handle form input changes
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle test result changes
    const handleTestResultChange = (e) => {
        setNewTestResult({
            ...newTestResult,
            [e.target.name]: e.target.value
        });
    };

    // Add a new test result to the form
    const addTestResult = () => {
        setFormData({
            ...formData,
            testResults: [...formData.testResults, newTestResult]
        });
        setNewTestResult({
            name: '',
            value: '',
            unit: '',
            lower: '',
            upper: '',
            status: 'Normal',
            notes: ''
        });
    };

    // Handle file input change
    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            file: e.target.files[0]
        });
    };

    // Handle form submission (creating lab result)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const labData = new FormData();
        labData.append('interpretation', formData.interpretation);
        labData.append('recommendations', formData.recommendations);
        labData.append('testResults', JSON.stringify(formData.testResults)); // send test results as JSON string
        labData.append('file', formData.file);
        labData.append('doctorId', doctorId);

        try {
            await axios.post(`http://localhost:8000/doctor/api/createLaboratoryResult/${patientId}/${appointmentId}`, labData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Laboratory result created successfully');
            setFormData({
                interpretation: '',
                recommendations: '',
                testResults: [],
                file: null
            });
        } catch (err) {
            setError('Failed to create laboratory result');
        }
    };

    // Download file
    const downloadFile = async (resultId) => {
        try {
            const response = await axios.get(`http://localhost:8000/doctor/api/laboratoryResult/download/${resultId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'laboratory_result.pdf'); // you can change this filename if necessary
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            setError('Failed to download file');
        }
    };

    return (
        <Container>
            <h3>Laboratory Results for Appointment #{appointmentId}</h3>
            {error && <p className="text-danger">{error}</p>}
            
            {/* Form for submitting lab results */}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="interpretation">
                    <Form.Label>Interpretation</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="interpretation"
                        value={formData.interpretation}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                <Form.Group controlId="recommendations">
                    <Form.Label>Recommendations</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="recommendations"
                        value={formData.recommendations}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                {/* Add test results */}
                <h5>Test Results</h5>
                <Form.Group>
                    <Form.Label>Test Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={newTestResult.name}
                        onChange={handleTestResultChange}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Value</Form.Label>
                    <Form.Control
                        type="text"
                        name="value"
                        value={newTestResult.value}
                        onChange={handleTestResultChange}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Unit</Form.Label>
                    <Form.Control
                        type="text"
                        name="unit"
                        value={newTestResult.unit}
                        onChange={handleTestResultChange}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Reference Range</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Lower"
                        name="lower"
                        value={newTestResult.lower}
                        onChange={handleTestResultChange}
                    />
                    <Form.Control
                        type="number"
                        placeholder="Upper"
                        name="upper"
                        value={newTestResult.upper}
                        onChange={handleTestResultChange}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select name="status" value={newTestResult.status} onChange={handleTestResultChange}>
                        <option value="Normal">Normal</option>
                        <option value="Abnormal">Abnormal</option>
                        <option value="Critical">Critical</option>
                    </Form.Select>
                </Form.Group>
                <Button variant="secondary" onClick={addTestResult}>
                    Add Test Result
                </Button>

                {/* File upload */}
                <Form.Group controlId="file">
                    <Form.Label>Upload File</Form.Label>
                    <Form.Control type="file" onChange={handleFileChange} />
                </Form.Group>

                <Button type="submit" variant="primary" className="mt-3">
                    Submit Laboratory Result
                </Button>
            </Form>

            {/* List of laboratory results */}
            <h4 className="mt-4">Previous Laboratory Results</h4>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Interpretation</th>
                        <th>Recommendations</th>
                        <th>Test Results</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {labResults.map((result) => (
                        <tr key={result._id}>
                            <td>{result.interpretation}</td>
                            <td>{result.recommendations}</td>
                            <td>
                                <ul>
                                    {result.testResults.map((test, index) => (
                                        <li key={index}>{test.name}: {test.value} {test.unit} (Range: {test.referenceRange.lower}-{test.referenceRange.upper})</li>
                                    ))}
                                </ul>
                            </td>
                            <td>
                                {result.file && (
                                    <Button variant="secondary" onClick={() => downloadFile(result._id)}>
                                        Download File
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default LaboratoryResults;
