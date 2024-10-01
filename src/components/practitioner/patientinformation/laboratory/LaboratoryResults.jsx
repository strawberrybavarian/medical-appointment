import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Container } from 'react-bootstrap';
import axios from 'axios';

function LaboratoryResults({ patientId, appointmentId }) {
    const [formData, setFormData] = useState({
        file: null
    });
    const [labResults, setLabResults] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null); // To show success message

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

    // Handle file input change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type !== 'application/pdf') {
            setError('Only PDF files are allowed.');
            setFormData({
                ...formData,
                file: null
            });
        } else {
            setError(null); // Clear any previous errors
            setFormData({
                ...formData,
                file: file
            });
        }
    };

    // Handle form submission (creating lab result with file upload)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Reset error state before submission
        setSuccess(null); // Reset success state
    
        if (!formData.file) {
            setError('Please upload a PDF file.');
            return;
        }
    
        const labData = new FormData();
        labData.append('file', formData.file);
    
        // Add an empty array for testResults if it's not being used
        labData.append('testResults', JSON.stringify([]));
    
        try {
            await axios.post(`http://localhost:8000/doctor/api/createLaboratoryResult/${patientId}/${appointmentId}`, labData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Ensure this is correctly set
                }
            });
            setSuccess('Laboratory result uploaded successfully');
            setFormData({
                file: null
            });
        } catch (err) {
            setError('Failed to upload laboratory result');
            console.error('Error uploading file:', err.response?.data || err.message);
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
            console.error('Error downloading file:', err.response?.data || err.message);
        }
    };

    return (
        <Container>
            <h3>Upload Laboratory Results for Appointment #{appointmentId}</h3>
            {error && <p className="text-danger">{error}</p>}
            {success && <p className="text-success">{success}</p>}

            {/* Form for uploading lab results */}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="file">
                    <Form.Label>Upload Laboratory Result (PDF Only)</Form.Label>
                    <Form.Control
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange} 
                    />
                </Form.Group>

                <Button type="submit" variant="primary" className="mt-3">
                    Upload Laboratory Result
                </Button>
            </Form>

            {/* List of laboratory results with download option */}
            <h4 className="mt-4">Download Laboratory Results</h4>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {labResults.map((result) => (
                        <tr key={result._id}>
                            <td>
                                {result.file && (
                                    <Button variant="secondary" onClick={() => downloadFile(result._id)}>
                                        Download Laboratory Result
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
