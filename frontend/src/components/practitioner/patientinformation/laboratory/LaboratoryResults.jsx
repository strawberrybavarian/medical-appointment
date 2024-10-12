import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import LaboratoryHistory from './LaboratoryHistory';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import { ip } from '../../../../ContentExport';
function LaboratoryResults({ patientId, appointmentId }) {
    const [formData, setFormData] = useState({
        file: null
    });
    const [labResults, setLabResults] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLabResults = async () => {
            try {
                const response = await axios.get(`${ip.address}/patient/${patientId}/appointments/${appointmentId}/labResults`);
                setLabResults(response.data);
                console.log(response.data);
            } catch (err) {
                setError('Failed to fetch laboratory results');
                toast.error('Failed to fetch laboratory results'); // Show error toast
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
            toast.error('Only PDF files are allowed.'); // Show error toast
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

        if (!formData.file) {
            setError('Please upload a PDF file.');
            toast.error('Please upload a PDF file.'); // Show error toast
            return;
        }

        const labData = new FormData();
        labData.append('file', formData.file);
        labData.append('testResults', JSON.stringify([])); // Add empty test results if needed

        try {
            await axios.post(`${ip.address}/doctor/api/createLaboratoryResult/${patientId}/${appointmentId}`, labData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Ensure this is correctly set
                }
            });
            setFormData({
                file: null
            });
            toast.success('Laboratory result uploaded successfully'); // Show success toast
        } catch (err) {
            setError('Failed to upload laboratory result');
            toast.error('Failed to upload laboratory result'); // Show error toast
            console.error('Error uploading file:', err.response?.data || err.message);
        }
    };

    // Download file
    const downloadFile = async (resultId) => {
        try {
            const response = await axios.get(`${ip.address}/doctor/api/laboratoryResult/download/${resultId}`, {
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
            toast.error('Failed to download file'); // Show error toast
            console.error('Error downloading file:', err.response?.data || err.message);
        }
    };

    return (
        <Container fluid>
            {/* React Toast Container to display notifications */}
            <ToastContainer />

            <Row>
                <Col md={6}>
                    <h4 className="m-0 font-weight-bold text-gray">Past Laboratories</h4>
                    <hr />
                    <LaboratoryHistory pid={patientId} />
                </Col>
                <Col>
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
                </Col>
            </Row>
        </Container>
    );
}

export default LaboratoryResults;
