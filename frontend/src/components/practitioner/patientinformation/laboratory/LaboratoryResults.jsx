import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import LaboratoryHistory from './LaboratoryHistory';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ip } from '../../../../ContentExport';
function LaboratoryResults({ patientId, appointmentId }) {
    const [formData, setFormData] = useState({
        file: null
    });
    const [labResults, setLabResults] = useState([]);
    const [error, setError] = useState(null);
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type !== 'application/pdf') {
            setError('Only PDF files are allowed.');
            setFormData({
                ...formData,
                file: null
            });
            toast.error('Only PDF files are allowed.');
        } else {
            setError(null);
            setFormData({
                ...formData,
                file: file
            });
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!formData.file) {
            setError('Please upload a PDF file.');
            toast.error('Please upload a PDF file.');
            return;
        }
        const labData = new FormData();
        labData.append('file', formData.file);
        labData.append('testResults', JSON.stringify([]));
        try {
            await axios.post(`${ip.address}/api/doctor/api/createLaboratoryResult/${patientId}/${appointmentId}`, labData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setFormData({
                file: null
            });
            toast.success('Laboratory result uploaded successfully');
        } catch (err) {
            setError('Failed to upload laboratory result');
            toast.error('Failed to upload laboratory result');
            console.error('Error uploading file:', err.response?.data || err.message);
        }
    };
    const downloadFile = async (resultId) => {
        try {
            const response = await axios.get(`${ip.address}/api/doctor/api/laboratoryResult/download/${resultId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'laboratory_result.pdf');
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            setError('Failed to download file');
            toast.error('Failed to download file');
            console.error('Error downloading file:', err.response?.data || err.message);
        }
    };
    return (
        <Container fluid>
            {}
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