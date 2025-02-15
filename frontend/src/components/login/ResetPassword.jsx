import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Modal } from 'react-bootstrap';
import { ip } from '../../ContentExport';
import ForLoginAndSignupNavbar from '../landpage/ForLoginAndSignupNavbar';
import Footer from '../Footer';

const ResetPassword = () => {
    const { token, role } = useParams();  // Capture the role and token from URL params
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            // Determine the API endpoint based on the user role (Patient or Doctor)
            const resetEndpoint = role === 'doctor' 
                ? `${ip.address}/api/doctor/reset-password/${token}` 
                : `${ip.address}/api/patient/reset-password/${token}`;

            const response = await axios.post(resetEndpoint, { password });
            setMessage(response.data.message);

            // Show success modal and then redirect to login page after successful reset
            setShowSuccessModal(true);
            setTimeout(() => {
                navigate('/medapp/login');
            }, 3000);  // Adjust the timing as needed
        } catch (err) {
            console.error('Error in resetting password:', err);
            setMessage(err.response?.data?.message || 'An error occurred.');
        }
    };

    return (
        <>
            <ForLoginAndSignupNavbar />

            <Container fluid className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
                <Row className="flex-grow-1 d-flex justify-content-center align-items-center">
                    <Col xs={11} md={8} lg={6}>
                        <Card className="p-4 shadow">
                            <h2 className="text-center">Reset Password</h2>
                            {message && <p className="text-center text-danger">{message}</p>}
                            <Form onSubmit={handleResetPassword}>
                                <Form.Group className="mb-3" controlId="formNewPassword">
                                    <Form.Label>New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formConfirmPassword">
                                    <Form.Label>Confirm New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </Form.Group>
                                <div className="d-grid">
                                    <Button variant="primary" type="submit">
                                        Reset Password
                                    </Button>
                                </div>
                            </Form>
                        </Card>
                    </Col>
                </Row>

                {/* Success Modal */}
                <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Success</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        <div className="mb-3">
                            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                        </div>
                        <p>Your password has been successfully changed.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="success" onClick={() => navigate('/medapp/login')}>
                            OK
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Footer className="mt-auto" />
            </Container>
        </>
    );
};

export default ResetPassword;
