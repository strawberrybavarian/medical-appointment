import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';
import { ip } from '../../ContentExport';

const ResetPassword = () => {
    const { token, role } = useParams();  // Capture the role and token from URL params
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

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

            // Redirect to login page after successful reset
            setTimeout(() => {
                navigate('/medapp/login');
            }, 1000);
        } catch (err) {
            console.error('Error in resetting password:', err);
            setMessage(err.response?.data?.message || 'An error occurred.');
        }
    };

    return (
        <Container className="mt-5">
            <h2>Reset Password</h2>
            {message && <p>{message}</p>}
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
                <Button variant="primary" type="submit">
                    Reset Password
                </Button>
            </Form>
        </Container>
    );
};

export default ResetPassword;
